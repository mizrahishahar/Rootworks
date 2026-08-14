const sd=$getWorkflowStaticData('global');
const ch=(sd.write&&sd.write.current)||{};
const c=sd.clients[ch.clientRecId];
const isGone=s=>/INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND|TABLE_NOT_FOUND|NOT_FOUND|MODEL_ID_NOT_FOUND/i.test(s);
try{
  for(const it of $('Patch Records').all()){
    const j=it.json||{};
    if(Array.isArray(j.records)) c.updates[ch.tableName]=(c.updates[ch.tableName]||0)+j.records.length;
    else if(j.error){
      const s=JSON.stringify(j.error).slice(0,300);
      if(isGone(s)){ c.goneTables[ch.tableName]=(c.goneTables[ch.tableName]||0)+1; }
      else { c.errors.push('patch '+ch.tableName+': '+s.slice(0,200)); c.writeOk=false; }
    }
  }
}catch(e){}
return [{json:{done:true}}];