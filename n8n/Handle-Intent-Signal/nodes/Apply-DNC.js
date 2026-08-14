const dnc=new Set();
try{
  const r=$('Get DNC Domains').first().json||{};
  for(const rec of (r.records||[])){ const f=rec.fields||{}; const d=String(f.Domain||f.domain||'').toLowerCase().trim(); if(d) dnc.add(d); }
}catch(e){}
const out=[];
for(const i of $('Build Intent Leads').all()){
  const d=String(i.json['Domain']||'').toLowerCase().trim();
  if(dnc.size && d && dnc.has(d)) continue;
  out.push({ json: i.json });
}
return out;