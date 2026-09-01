// Apply DNC: drops people whose domain sits on the client's DNC table (every page of it, read
// once per batch by Get DNC Domains), and strips the underscore carriers (_stats, _empty) plus
// any key the People table does not carry (Clean Fields may add a column a table lacks), so
// the upsert never meets an unknown key. Zero survivors still emit one {_empty} placeholder
// so the gate reaches the close. Batch Summary counts the drop as rows in minus rows out.
const have=new Set(($('Batch Input').first().json.peopleFields)||[]);
const dnc=new Set();
try{ for(const it of $('Get DNC Domains').all()){ const j=it.json||{}; const f=j.fields||{}; const d=String(f.Domain||f.domain||'').toLowerCase().trim(); if(d) dnc.add(d); } }catch(e){}
const out=[];
for(const i of $('Clean Fields').all()){
  const j=i.json||{};
  if(j._empty) continue;
  const d=String(j['Domain']||'').toLowerCase().trim();
  if(dnc.size&&d&&dnc.has(d)) continue;
  const row={};
  for(const k of Object.keys(j)){ if(k.startsWith('_')) continue; if(!have.has(k)) continue; row[k]=j[k]; }
  out.push({ json: row });
}
if(!out.length) return [{ json: { _empty:true } }];
return out;
