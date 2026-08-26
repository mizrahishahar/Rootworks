// Contact Calls: one row per ICP-approved company, carrying Existing In Role and the request
// bodies for both contact sources.
//
// Sources (Operator ruling 2026-08-26: Supersoniq is out of this machine entirely):
//   ContaGen (DiscoLike /contacts/discover)  pulled WIDE: every Technology / Executive person
//   at any decision level, so nobody is lost before the gates (DiscoLike bills net-new only).
//   AI-Ark people search                     people whose CURRENT title matches the play's
//   `people:` titles (WORD mode), the play's cap per company; 0.5 credits per returned
//   profile. The play dictates the titles; nothing is hardcoded here.
//
// Existing In Role: DiscoLike contact count on the play's roles; the company must be known to
// BizData for the count to mean anything. The tier rule reads it as first hire: 0 = yes,
// above 0 = no, blank (unknown company) = unknown. Never guessed.
const cfg=$('Parse Play').first().json;
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const calls=$('Count Calls').all().map(i=>i.json).filter(c=>c&&c.domain);
let cgItems=[];
try{ cgItems=$('CG Count').all(); }catch(e){}
const stats={ yes:0, no:0, unknown:0, cg_errors:0, failed:[] };
const out=[];
calls.forEach((c,i)=>{
  let known=false, count=0;
  const cj=(cgItems[i]&&cgItems[i].json)||{}; const cb=parse(cj.body===undefined?null:cj.body);
  const cs=Number(cj.statusCode)||0;
  const bizKnown=!!(($('Apply ICP').all()[i]||{}).json||{}).biz;
  if(cs>=200&&cs<300&&cb&&typeof cb==='object'&&cb.count!==undefined){ if(bizKnown){ known=true; count=Number(cb.count)||0; } }
  else if(cs){ stats.cg_errors++; stats.failed.push({ tier:'In role (DiscoLike)', name:c.domain, reason:'HTTP '+cs+' '+String((cb&&(cb.detail||cb.error))||'').slice(0,100) }); }
  const firstHire=!known?'unknown':(count===0?'yes':'no');
  stats[firstHire]++;
  const p=cfg.people;
  out.push({ json: {
    domain:c.domain, existing_in_role: known?count:null, first_hire: firstHire,
    cg:{ domain:[c.domain], department:['Technology','Executive'], seniority:['executive','vp','director','manager'], has_linkedin:true, max_companies:1, results_by_company:p.cap },
    ark:{ contact:{ experience:{ current:{ title:{ any:{ include:{ mode:'WORD', content:p.titles } } } } } }, account:{ domain:{ any:{ include:[c.domain] } } }, page:0, size:p.cap }
  }});
});
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
