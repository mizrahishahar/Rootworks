// Closes one field-ensure call and advances the queue Plan Variables built (the register's
// machine fields missing from the source table). A failed create lands in failed[], so the
// row reads Succeeded with errors; a created column is a warning the Operator sees; the next
// missing field loops back through Need Machine Field?. The queue exhausted, the door reads the view.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const E=D.ensure||{queue:[], idx:0};
const j=($input.first()||{}).json||{};
const cur=E.queue[E.idx]||{};
const tbl=D.tableName||D.tableId||'?';
if(j.id&&!j.error){ D.warnings.push('created column "'+(cur.name||'?')+'" on "'+tbl+'"'); }
else { D.errors.push('create column "'+(cur.name||'?')+'" on "'+tbl+'" failed: '+JSON.stringify(j.error||j).slice(0,200)); }
E.idx++;
const next=E.queue[E.idx]||null;
return [{json:{needDe:!!next, field:next, view:D.view, crBase:D.crBase, tableId:D.tableId, dncTableId:D.dncTableId, mirrorTableId:D.mirrorTableId}}];
