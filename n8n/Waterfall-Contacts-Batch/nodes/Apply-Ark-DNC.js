// Apply Ark DNC: the same DNC pass as Apply DNC, on the AI-Ark rows after Clean Ark Fields.
// Same DNC pages (Get DNC Domains ran once for the batch), same key fence, same placeholder.
const have=new Set(($('Batch Input').first().json.peopleFields)||[]);
const dnc=new Set();
try{ for(const it of $('Get DNC Domains').all()){ const j=it.json||{}; const f=j.fields||{}; const d=String(f.Domain||f.domain||'').toLowerCase().trim(); if(d) dnc.add(d); } }catch(e){}
const out=[];
for(const i of $('Clean Ark Fields').all()){
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
