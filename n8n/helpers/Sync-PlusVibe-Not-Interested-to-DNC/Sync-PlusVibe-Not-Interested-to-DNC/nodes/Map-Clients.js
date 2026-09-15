// Map Clients: the client loop. Every Hub Clients row with a PlusVibe Workspace ID and a Clayroots
// Base ID (the search already filtered on both); a launched run with a Client on its row keeps that
// one only. The filter is applied here once, never deeper. An empty pick emits one placeholder so the
// Any Clients? gate routes straight to the run log (a loop node fed nothing never runs).
const sd=$getWorkflowStaticData('global');
const cf=String((sd.run||{}).clientFilter||'').trim();
const out=[];
for(const it of $input.all()){
  const r=it.json||{};
  const f=r.fields||r;
  const name=String(f['Client']||f['Client name']||'').trim();
  const ws=String(f['PlusVibe Workspace ID']||'').trim();
  const crBase=String(f['Clayroots Base ID']||'').trim();
  if(!r.id||!name||!ws||!crBase) continue;
  if(cf && r.id!==cf) continue;
  out.push({ json:{ clientRecId:r.id, clientName:name, ws, crBase } });
}
if(!out.length) return [{ json:{ _empty:true } }];
return out;
