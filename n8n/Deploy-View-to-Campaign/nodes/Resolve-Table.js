// Resolve Table: the launch names the table (People or Companies, blank = People); its id comes
// from the base schema just read, never from the Hub (ClayRoots Standard, law 3). Runs on the
// schema phase of the meta loop only; the view phase passes straight through to Meta Router,
// which keeps its own verdict on an unreadable schema.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const j=($input.first()||{}).json||{};
if(!D.abort && (!D.metaPhase||D.metaPhase==='schema')){
  const tables=Array.isArray(j.tables)?j.tables:[];
  const want=String(D.table||'People').trim();
  const t=tables.find(x=>String(x.name||'').trim().toLowerCase()===want.toLowerCase());
  if(t){ D.tableId=t.id; D.tableName=t.name; }
  else if(tables.length){ D.abort='table not found'; D.errors.push('Base '+D.crBase+' has no '+want+' table. Scaffold the base first. Nothing was spent or written.'); }
}
return [{json:j}];
