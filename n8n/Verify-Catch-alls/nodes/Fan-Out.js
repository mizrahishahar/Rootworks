// Fan Out: the hourly schedule serves every client. One item per Clients row that carries a
// Clayroots Base ID; each becomes its own run of this machine (Run Per Client, not awaited) with
// the whole People table, so every client's row is its own and a slow one never blocks another.
const out=[];
for(const it of $input.all()){ const j=it.json||{}; const f=j.fields||{}; const base=String(f['Clayroots Base ID']||'').trim(); if(!/^app[A-Za-z0-9]{14}$/.test(base)) continue; out.push({ json:{ base, clientRecId:j.id, client:String(f.Client||''), table:'People', view:'', trigger:'schedule', parentExecId:String($execution.id) } }); }
if(!out.length) return [{ json:{ _empty:true } }];
return out;
