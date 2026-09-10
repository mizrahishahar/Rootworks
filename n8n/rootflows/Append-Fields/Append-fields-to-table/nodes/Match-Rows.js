const g=$('Guard Schema').first().json;
const lookup=g.lookup;
const out=[];
for(const item of $input.all()){ const j=item.json; const f=j.fields||{}; const k=String(f[g.keyName]||'').trim().toLowerCase(); if(!k) continue; const attrs=lookup[k]; if(!attrs) continue; out.push({ json: Object.assign({ id: j.id }, attrs) }); }
if(out.length===0){ return [{ json: { _zeroMatch: true, _tableRowsScanned: $input.all().length } }]; }
return out;