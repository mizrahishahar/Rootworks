// Pick Rows: every row of the view is asked. A count is a measurement, so a row already holding a
// number is counted again and overwritten; there is no Overwrite switch. A row without a Domain is
// skipped and counted; several rows on one domain share one ask and all receive the number. One
// item out: the plan, or {_none} when nothing is left to ask.
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const rows=$input.all().map(i=>i.json||{}).filter(j=>j.id);
const st={ inView:rows.length, noDomain:0, asked:0, domains:0 };
const byDomain={};
for(const r of rows){
  const f=r.fields||{};
  const d=norm(f.Domain); if(!d){ st.noDomain++; continue; }
  st.asked++;
  (byDomain[d]=byDomain[d]||[]).push(String(r.id));
}
const domains=Object.keys(byDomain);
st.domains=domains.length;
if(!domains.length) return [{ json:{ _none:true, refused:'', stats:st } }];
return [{ json:{ refused:'', stats:st, byDomain, domains } }];
