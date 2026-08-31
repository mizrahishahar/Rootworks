// Contact Calls: one row per ICP-approved company, carrying Existing In Role and the request
// bodies for both contact sources.
//
// PULL DOCTRINE (the estate standard, mirrored from SQ Contacts Batch, Operator 2026-08-28):
// pull WIDE, cut in the base. The seniority net is fixed in code, never per-signal config:
// nothing about who gets MESSAGED lives here; the relevance formula and the views on the
// target table do all the cutting, visibly and reversibly.
//   ContaGen (DiscoLike /contacts/discover): seniority net only, NO department filter (we do
//   not trust the classifier enough to let it silently exclude someone), limit 12 per company
//   (a circuit-breaker, not a target; DiscoLike bills net-new only).
//   AI-Ark people search: a fixed wide title vocabulary (decision makers AND the infra
//   practitioners), WORD mode, size 12; 0.5 credits per returned profile (max 6 cr/company).
//
// Existing In Role: DiscoLike contact count on the signal's roles; the company must be known to
// BizData for the count to mean anything. 0 = first hire yes, above 0 = no, blank = unknown.
const cfg=$('Parse Play').first().json;
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const calls=$('Count Calls').all().map(i=>i.json).filter(c=>c&&c.domain);
let cgItems=[];
try{ cgItems=$('CG Count').all(); }catch(e){}
const stats={ yes:0, no:0, unknown:0, cg_errors:0, failed:[] };

const CG_SENIORITY=['executive','vp','director','manager'];
const PER_COMPANY_LIMIT=12;
const ARK_TITLES=['Founder','Co-Founder','Owner','Partner','President','CEO','CTO','COO','CIO','CISO','CPO','CRO','CFO','Chief','VP','Vice President','SVP','EVP','Head','Director','Manager','Principal','Staff','Lead'];

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
  out.push({ json: {
    domain:c.domain, existing_in_role: known?count:null, first_hire: firstHire,
    cg:{ domain:[c.domain], seniority:CG_SENIORITY, has_linkedin:true, max_companies:1, results_by_company:PER_COMPANY_LIMIT },
    ark:{ contact:{ experience:{ current:{ title:{ any:{ include:{ mode:'WORD', content:ARK_TITLES } } } } } }, account:{ domain:{ any:{ include:[c.domain] } } }, page:0, size:PER_COMPANY_LIMIT }
  }});
});
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
