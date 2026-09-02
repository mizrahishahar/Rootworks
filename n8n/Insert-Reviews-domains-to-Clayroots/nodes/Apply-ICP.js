// Apply ICP: a company the check called `yes` or `partial` goes on (Operator ruling 2026-08-23:
// partial stays in). `no` and missing verdicts are dropped with their reason kept for the run log.
// A check that never completed rejects everything and is logged as an error: no company is ever
// passed through on a missing verdict.
// One row per kept company: { domain, company, biz, icp_reason, icp_confidence }.
// Reused verbatim from Handle Hiring Intent Signal.
const poll=$input.first().json||{};
const facts=$('Company Facts').first().json||{};
const companies=facts.companies||{};
const stats={ checked:0, yes:0, partial:0, no:0, missing:0, error:poll.error||'', rejected:[] };
const out=[];
if(poll.error||!poll.results){
  stats.error=poll.error||'no results';
  return [{ json: { _empty:true, _stats:stats } }];
}
const res=poll.results;
for(const d of Object.keys(companies)){
  const r=res[d]||res[d.replace(/^www\./,'')]||null;
  stats.checked++;
  if(!r){ stats.missing++; stats.rejected.push({ domain:d, fit:'missing', reason:'no verdict returned' }); continue; }
  const fit=String(r.Fit||r.fit||'').toLowerCase();
  const reason=String(r.Reasoning||r.reasoning||'').slice(0,200);
  const conf=String(r.Confidence||r.confidence||'');
  if(fit==='yes'||fit==='partial'){ if(fit==='yes') stats.yes++; else stats.partial++; out.push({ json: { domain:d, company:companies[d].company, biz:companies[d].biz, icp_reason:(fit==='partial'?'PARTIAL: ':'')+reason, icp_confidence:conf } }); }
  else { stats.no++; stats.rejected.push({ domain:d, fit:fit||'?', reason }); }
}
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
