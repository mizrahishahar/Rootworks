const sd=$getWorkflowStaticData('global');
sd.syncResults=[];
const launch=sd.launch||{};
const cf=String(launch.clientFilter||'');
const nowIL=$now.setZone('Asia/Jerusalem');
const yesterday=nowIL.minus({days:1}).toFormat('yyyy-MM-dd');
const today=nowIL.toFormat('yyyy-MM-dd');
// Scheduled runs sync every PV client. A launched run with a Client on its launch row syncs that client only.
const all=$('Get PV Clients').all().filter(it=>it.json&&it.json.id);
const picked=cf?all.filter(it=>it.json.id===cf):all;
sd.syncScope=cf?(picked.length?'one client (on demand)':'client filter matched no PV client'):'all clients';
// Nothing to loop over: emit one placeholder so the Any Clients? gate can route straight to the run log.
if(!picked.length) return [{ json: { _empty:true } }];
return picked.map(it=>{
  const j=it.json; const f=j.fields||j;
  return { json: { clientRecId:j.id, clientName:f['Client']||'', pvWorkspace:String(f['PlusVibe Workspace ID']||'').trim(), yesterday, today } };
});
