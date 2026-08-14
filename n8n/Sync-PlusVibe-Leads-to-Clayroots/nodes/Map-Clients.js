const sd=$getWorkflowStaticData('global');
const cf=String((sd.run||{}).clientFilter||'').toLowerCase();
const out=[];
for(const it of $input.all()){
  const r=it.json||{};
  const f=r.fields||r;
  const name=String(f['Client name']||f['Client']||'').trim();
  const ws=String(f['PlusVibe Workspace ID']||'').trim();
  const crBase=String(f['Clayroots Base ID']||'').trim();
  if(!r.id||!name||!ws||!crBase) continue;
  if(cf && name.toLowerCase().indexOf(cf)===-1) continue;
  out.push({json:{clientRecId:r.id, clientName:name, ws, crBase}});
}
return out;