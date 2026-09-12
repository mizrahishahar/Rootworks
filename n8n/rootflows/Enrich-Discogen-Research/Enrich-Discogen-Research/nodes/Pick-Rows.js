// Pick Rows: the view's rows become the ask. A row without a Domain is skipped and counted; a row
// already holding a value in Output Field is skipped unless Overwrite; several rows on one domain
// share one ask and all receive the answer. The spend gate: more domains to ask than Max companies
// is a refusal on the row (DiscoGen bills the account's LLM key per domain), never a silent cut.
// One item out: the plan, or a refusal, or {_none} when nothing is left to ask.
const p=$('Params').first().json;
const c=$('Check Columns').first().json;
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const held=(v)=>!(v===undefined||v===null||v===''||v===false||(Array.isArray(v)&&!v.length));
const rows=$input.all().map(i=>i.json||{}).filter(j=>j.id);
const st={ inView:rows.length, noDomain:0, alreadyAnswered:0, asked:0, domains:0 };
const byDomain={};
for(const r of rows){
  const f=r.fields||{};
  const d=norm(f.Domain); if(!d){ st.noDomain++; continue; }
  if(!p.overwrite&&held(f[p.outputField])){ st.alreadyAnswered++; continue; }
  st.asked++;
  (byDomain[d]=byDomain[d]||[]).push(String(r.id));
}
const domains=Object.keys(byDomain);
st.domains=domains.length;
if(!domains.length) return [{ json:{ _none:true, refused:'', stats:st } }];
if(domains.length>p.maxCompanies) return [{ json:{ refused:'View "'+p.view+'" has '+domains.length+' companies to ask and Max companies is '+p.maxCompanies+'. Raise the cap or narrow the view. Nothing was asked.', stats:st } }];
return [{ json:{ refused:'', stats:st, byDomain, domains } }];
