// Pick Companies: the Companies view rows become the run's company list. Rows without a
// Domain are counted and dropped; duplicate domains collapse to one; Max companies caps
// the list (the spend cap). One item out, always, so the empty-pick gate reaches the close.
const p=$('Launch Params').first().json;
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const seen=new Set(); const companies=[];
const stats={ viewRows:0, noDomain:0, duplicate:0, capped:0, picked:0 };
for(const it of $input.all()){
  const j=it.json||{}; if(!j.id) continue; stats.viewRows++;
  const f=j.fields||{};
  const d=norm(f.Domain); if(!d){ stats.noDomain++; continue; }
  if(seen.has(d)){ stats.duplicate++; continue; }
  if(p.maxCompanies&&companies.length>=p.maxCompanies){ stats.capped++; continue; }
  seen.add(d);
  companies.push({ recordId:j.id, domain:d, company:String(f.Company||'').trim(), employees:String(f.Employees==null?'':f.Employees).trim(), tag:String(f.Tag||'').trim() });
}
stats.picked=companies.length;
return [{ json: { picked: companies.length, domains: companies.map(c=>c.domain), companies: companies, _stats: stats } }];
