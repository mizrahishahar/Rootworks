const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const inFirst=($input.first()||{}).json||{};
if(!inFirst._none){
  try{
    const res=$('Create Fields').all();
    let ok=0;
    for(const it of res){ const j=it.json||{}; if(j.id) ok++; else if(j.error){ c.errors.push('field create: '+JSON.stringify(j.error).slice(0,200)); c.writeOk=false; } }
    c.fieldsCreated=ok;
  }catch(e){}
}
const emails=Object.keys(c.payloads);
sd.write={queue:[], idx:0, current:null};
for(const t of c.targetTables){
  for(let i=0;i<emails.length;i+=100){
    const slice=emails.slice(i,i+100);
    const formula='OR('+slice.map(e=>'LOWER(TRIM({Final Email}))="'+e.replace(/"/g,'')+'"').join(',')+')';
    sd.write.queue.push({clientRecId:sd.currentClient, crBase:c.crBase, tableId:t.id, tableName:t.name, formula, emails:slice.length});
  }
}
return [{json:{clientRecId:sd.currentClient, chunks:sd.write.queue.length, mirrorId:c.mirrorId||'', crBase:c.crBase}}];