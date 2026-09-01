// Apply DNC: drops contacts whose domain sits on the client's DNC table, and strips the
// underscore-prefixed carriers (_stats, _empty) so the upsert's auto-map never meets a key
// the table does not have. Build Run Log counts the DNC drop as (rows in) minus (rows out).
// Zero survivors still emit one {_empty} placeholder so the Any After DNC? gate reaches the close.
// Reused verbatim from Handle Hiring Intent Signal.
const dnc=new Set();
try{
  const r=$('Get DNC Domains').first().json||{};
  for(const rec of (r.records||[])){ const f=rec.fields||{}; const d=String(f.Domain||f.domain||'').toLowerCase().trim(); if(d) dnc.add(d); }
}catch(e){}
const out=[];
for(const i of $('Clean Fields').all()){
  const j=i.json||{};
  if(j._empty) continue;
  const d=String(j['Domain']||'').toLowerCase().trim();
  if(dnc.size&&d&&dnc.has(d)) continue;
  const row={};
  for(const k of Object.keys(j)){ if(!k.startsWith('_')) row[k]=j[k]; }
  out.push({ json: row });
}
if(!out.length) return [{ json: { _empty:true } }];
return out;
