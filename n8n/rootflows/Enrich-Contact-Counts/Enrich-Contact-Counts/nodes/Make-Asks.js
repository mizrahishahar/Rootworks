// Make Asks: one free count call per domain, POST /contacts/search/count {domains:[d], job_titles,
// exclude_job_titles}. Verified 2026-09-09 on the one-off (scripts/one-off/infra-ratio.js): the
// count endpoint answers {ok, total_matching, credits_used:0}; /contacts/search is the one that
// bills, and it is never called here. With no Titles the call carries only the domain, and the
// answer is everyone GetLeads holds there.
const p=$('Params').first().json;
const pick=$('Pick Rows').first().json||{};
if(pick._none) return [{ json:{ _none:true } }];
const out=[];
for(const d of (pick.domains||[])){
  const body={ domains:[d] };
  if(p.titles.length) body.job_titles=p.titles;
  if(p.excludeTitles.length) body.exclude_job_titles=p.excludeTitles;
  out.push({ json:{ domain:d, body } });
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
