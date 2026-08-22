const sd=$getWorkflowStaticData('global');
const cfRaw=String((sd.run||{}).clientFilter||'').trim();
const cf=cfRaw.toLowerCase();
// The filter is either a Clients record id (from a Hub launch row) or a name fragment (from a manual call).
const byId=/^rec[a-z0-9]{14}$/i.test(cfRaw);
const out=[];
for(const it of $input.all()){
  const r=it.json||{};
  const f=r.fields||r;
  const name=String(f['Client name']||f['Client']||'').trim();
  const ws=String(f['PlusVibe Workspace ID']||'').trim();
  const crBase=String(f['Clayroots Base ID']||'').trim();
  if(!r.id||!name||!ws||!crBase) continue;
  if(cf && (byId ? r.id!==cfRaw : name.toLowerCase().indexOf(cf)===-1)) continue;
  out.push({json:{clientRecId:r.id, clientName:name, ws, crBase}});
}
// Nothing to loop over: emit one placeholder so the Any Clients? gate can route straight to the run log.
if(!out.length) return [{json:{_empty:true}}];
return out;
