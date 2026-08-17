const sd=$getWorkflowStaticData('global');
sd.syncResults=[];
const nowIL=$now.setZone('Asia/Jerusalem');
const yesterday=nowIL.minus({days:1}).toFormat('yyyy-MM-dd');
return $('Get PV Clients').all().filter(it=>it.json&&it.json.id).map(it=>{
  const j=it.json; const f=j.fields||j;
  return { json: { clientRecId:j.id, clientName:f['Client']||'', pvWorkspace:String(f['PlusVibe Workspace ID']||'').trim(), yesterday } };
});