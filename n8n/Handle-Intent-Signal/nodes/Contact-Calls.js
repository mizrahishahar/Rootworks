// Contact Calls: one row per ICP-approved company, carrying the first-hire verdict and the
// request bodies for both contact sources, built from the play's people line.
//
// First hire: a source "knows" the company when it answered with a match; the count is the
// highest across the sources that know it. Yes = known and 0; No = known and above 0;
// Unknown = no source knows the company. Never guessed.
const cfg=$('Parse Play').first().json;
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const calls=$('Count Calls').all().map(i=>i.json).filter(c=>c&&c.domain);
let sqItems=[], cgItems=[];
try{ sqItems=$('SQ Count').all(); }catch(e){}
try{ cgItems=$('CG Count').all(); }catch(e){}
const stats={ yes:0, no:0, unknown:0, sq_errors:0, cg_errors:0, failed:[] };
const out=[];
calls.forEach((c,i)=>{
  let known=false, count=0;
  const sj=(sqItems[i]&&sqItems[i].json)||{}; const sb=parse(sj.body===undefined?null:sj.body);
  const ss=Number(sj.statusCode)||0;
  if(ss>=200&&ss<300&&sb&&typeof sb==='object'){
    const m=Array.isArray(sb.matched)?sb.matched[0]:(Array.isArray(sb.results)?sb.results[0]:null);
    if(m&&(m.company_id||m.company_name)){ known=true; count=Math.max(count, Number(m.available_contacts)||0); }
  } else if(ss){ stats.sq_errors++; stats.failed.push({ tier:'First hire (Supersoniq)', name:c.domain, reason:'HTTP '+ss+' '+String((sb&&(sb.error||sb.message))||'').slice(0,100) }); }
  const cj=(cgItems[i]&&cgItems[i].json)||{}; const cb=parse(cj.body===undefined?null:cj.body);
  const cs=Number(cj.statusCode)||0;
  const bizKnown=!!(($('Apply ICP').all()[i]||{}).json||{}).biz;
  if(cs>=200&&cs<300&&cb&&typeof cb==='object'&&cb.count!==undefined){ if(bizKnown){ known=true; count=Math.max(count, Number(cb.count)||0); } }
  else if(cs){ stats.cg_errors++; stats.failed.push({ tier:'First hire (DiscoLike)', name:c.domain, reason:'HTTP '+cs+' '+String((cb&&(cb.detail||cb.error))||'').slice(0,100) }); }
  const firstHire=!known?'Unknown':(count===0?'Yes':'No');
  stats[firstHire.toLowerCase()]++;
  const p=cfg.people;
  out.push({ json: {
    domain:c.domain, existing_in_role: known?count:null, first_hire: firstHire,
    cg:{ domain:[c.domain], title:p.titles, negate_title:p.never, has_linkedin:true, max_companies:1, results_by_company:p.cap },
    sq:{ companies:[{ domain:c.domain }], filters:{ job_titles:p.titles, has_linkedin:true }, tier:'full', per_company_limit:p.cap, confirm:true }
  }});
});
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
