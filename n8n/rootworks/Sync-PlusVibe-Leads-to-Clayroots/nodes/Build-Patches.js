const sd=$getWorkflowStaticData('global');
const ch=(sd.write&&sd.write.current)||{};
const c=sd.clients[ch.clientRecId];
const isGone=s=>/INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND|TABLE_NOT_FOUND|NOT_FOUND|MODEL_ID_NOT_FOUND/i.test(s);
const recs=[];
for(const it of $input.all()){
  const j=it.json||{};
  if(Array.isArray(j.records)) recs.push(...j.records);
  else if(j.error){
    const s=JSON.stringify(j.error).slice(0,300);
    if(isGone(s)){ c.goneTables[ch.tableName]=(c.goneTables[ch.tableName]||0)+1; }
    else { c.errors.push('list '+ch.tableName+': '+s.slice(0,200)); c.writeOk=false; }
  }
}
const norm=e=>String(e||'').toLowerCase().trim();
const patches=[];
for(const r of recs){
  const em=norm((r.fields||{})['Final Email']);
  const p=c.payloads[em];
  if(!p) continue;
  const fields={'Messages Sent':p['Messages Sent'], 'Campaign Status':p['Campaign Status'], 'Bounce Reason':p['Bounce Reason'], 'Synced At':p['Synced At']};
  if(p['Last Contacted']) fields['Last Contacted']=p['Last Contacted'];
  if(c.mirrorId){
    const links=[];
    for(const cid of (p['Campaigns']||[])){
      const rid=(c.mirrorMap||{})[cid];
      if(rid) links.push(rid);
      else if(!c._noMirrorWarned[cid]){ c._noMirrorWarned[cid]=1; c.warnings.push('no mirror row for campaign '+cid+'; Campaigns link skipped for its leads'); }
    }
    fields['Campaigns']=links;
  }
  patches.push({id:r.id, fields});
}
const out=[];
for(let i=0;i<patches.length;i+=10){
  out.push({json:{crBase:ch.crBase, tableId:ch.tableId, tableName:ch.tableName, clientRecId:ch.clientRecId, body:{records:patches.slice(i,i+10), typecast:true}}});
}
if(!out.length) return [{json:{_none:true}}];
return out;