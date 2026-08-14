const threads={};
for(const i of $input.all()){ const m=i.json.messages||[]; if(m.length>1){ threads[m[0].ts]=m.slice(1); } }
const all=($('BDR History').first().json.messages)||[];
return all.map(m=>{ const p=Object.assign({},m); p.replies=threads[m.ts]||[]; return {json:{channel:'BDR',msg:p}}; });