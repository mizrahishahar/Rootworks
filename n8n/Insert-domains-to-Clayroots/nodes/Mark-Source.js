// Mark Source: the cleaned rows become the upsert items. A domain Companies already holds keeps
// its Domain Source (the key is removed from the row); a new domain gets _meta.domainSource.
// Every "_" carrier is stripped so the upsert sends columns only.
const m=$('Read Meta').first().json;
const existing=new Set();
for(const it of $('Read Existing').all()){ const j=it.json||{}; const d=String((j.fields&&j.fields.Domain)||j.Domain||'').trim().toLowerCase(); if(d) existing.add(d); }
const out=[];
for(const it of $('Clean Fields').all()){
  const r=Object.assign({}, it.json||{});
  for(const k of Object.keys(r)){ if(k.charAt(0)==='_') delete r[k]; }
  if(!r.Domain) continue;
  if(existing.has(String(r.Domain).toLowerCase())) delete r['Domain Source']; else r['Domain Source']=m.domainSource;
  out.push({ json: r });
}
return out;
