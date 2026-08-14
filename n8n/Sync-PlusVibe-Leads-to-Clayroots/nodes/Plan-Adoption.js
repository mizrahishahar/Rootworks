const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const j=($input.first()||{}).json||{};
const tables=Array.isArray(j.tables)?j.tables:[];
if(!tables.length){ c.errors.push('schema fetch failed or base has no tables'); c.writeOk=false; return [{json:{_none:true}}]; }
const mirror=tables.find(t=>{ const names=new Set((t.fields||[]).map(f=>f.name)); return !names.has('Final Email') && names.has('Campaign ID') && names.has('Sequencer'); });
c.mirrorId=mirror?mirror.id:'';
const want=[
 {name:'Messages Sent', spec:{name:'Messages Sent', type:'number', options:{precision:0}}},
 {name:'Last Contacted', spec:{name:'Last Contacted', type:'dateTime', options:{dateFormat:{name:'iso'}, timeFormat:{name:'24hour'}, timeZone:'utc'}}},
 {name:'Campaign Status', spec:{name:'Campaign Status', type:'singleSelect', options:{choices:[{name:'NEVER_CONTACTED'},{name:'IN_SEQUENCE'},{name:'COMPLETED'},{name:'REPLIED'},{name:'BOUNCED'},{name:'UNSUBSCRIBED'}]}}},
 {name:'Bounce Reason', spec:{name:'Bounce Reason', type:'singleLineText'}},
 {name:'Synced At', spec:{name:'Synced At', type:'dateTime', options:{dateFormat:{name:'iso'}, timeFormat:{name:'24hour'}, timeZone:'utc'}}}
];
const out=[];
for(const t of tables){
  const fe=(t.fields||[]).find(f=>f.name==='Final Email');
  if(!fe) continue;
  if(fe.type!=='singleLineText' && fe.type!=='email'){ c.skippedTables.push(t.name+' (Final Email is '+fe.type+')'); continue; }
  c.targetTables.push({id:t.id, name:t.name});
  c.updates[t.name]=0;
  const have=new Set((t.fields||[]).map(f=>f.name));
  for(const w of want){ if(!have.has(w.name)) out.push({json:{tableId:t.id, tableName:t.name, field:w.spec}}); }
  if(mirror && !have.has('Campaigns')) out.push({json:{tableId:t.id, tableName:t.name, field:{name:'Campaigns', type:'multipleRecordLinks', options:{linkedTableId:mirror.id}}}});
}
if(!c.targetTables.length){ c.errors.push('no target tables with Final Email found in base'); c.writeOk=false; }
if(!mirror) c.warnings.push('no campaigns mirror table (Campaign ID + Sequencer fields, no Final Email); Campaigns link field skipped');
if(!out.length) return [{json:{_none:true}}];
return out;