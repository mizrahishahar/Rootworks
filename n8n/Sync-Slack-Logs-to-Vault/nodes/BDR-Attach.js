const threads={};
for(const i of $input.all()){ const m=(i.json&&i.json.messages)||[]; if(m.length>1){ threads[m[0].ts]=m.slice(1); } }
let all=[];
try{ all=($('BDR History').first().json.messages)||[]; }catch(e){ all=[]; }
if(!all.length) return [{json:{channel:'BDR',msg:null}}];
return all.map(m=>{ const p=Object.assign({},m); p.replies=threads[m.ts]||[]; return {json:{channel:'BDR',msg:p}}; });