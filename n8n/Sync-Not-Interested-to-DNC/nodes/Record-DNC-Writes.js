// Record DNC Writes: reads every create call back. Records returned are rows created; an error body
// is an error line. Counted by what Airtable returned, never by what was sent.
const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
for(const it of $input.all()){
  const j=it.json||{};
  if(Array.isArray(j.records)) c.dncCreated+=j.records.length;
  else c.errors.push('DNC create failed on '+c.dncTableName+': '+JSON.stringify(j.error||j).slice(0,200));
}
return [{ json:{ clientRecId:sd.currentClient } }];
