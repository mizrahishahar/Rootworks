// Resolve Table: the launch names the table (People or Companies, required, no default). Its id is
// the registry's (Clients.ClayrootsPeopleTableID / ClayrootsCompaniesTableID, read by Check Client)
// when the registry carries one, else the name match on the base schema just read. Runs on the
// schema phase of the meta loop only; the view phase passes straight through to Meta Router,
// which keeps its own verdict on an unreadable schema.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const j=($input.first()||{}).json||{};
if(!D.abort && (!D.metaPhase||D.metaPhase==='schema')){
  const tables=Array.isArray(j.tables)?j.tables:[];
  const want=String(D.table||'').trim();
  let t=D.regTableId?tables.find(x=>x.id===D.regTableId):null;
  if(!t&&D.regTableId&&tables.length) D.warnings.push('registry '+want+' table id '+D.regTableId+' is not in base '+D.crBase+'; resolved by name instead');
  if(!t) t=want?tables.find(x=>String(x.name||'').trim().toLowerCase()===want.toLowerCase()):null;
  if(t){ D.tableId=t.id; D.tableName=t.name; }
  else if(tables.length){ D.abort='table not found'; D.errors.push('Base '+D.crBase+' has no '+(want||'(blank)')+' table. Scaffold the base first. Nothing was spent or written.'); }
}
return [{json:j}];
