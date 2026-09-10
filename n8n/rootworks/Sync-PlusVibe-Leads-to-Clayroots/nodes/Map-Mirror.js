const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
c.mirrorMap={};
for(const it of $input.all()){
  const r=it.json||{};
  const f=r.fields||r;
  const cid=String(f['Campaign ID']||'').trim();
  if(cid&&r.id) c.mirrorMap[cid]=r.id;
}
return [{json:{mapped:Object.keys(c.mirrorMap).length}}];