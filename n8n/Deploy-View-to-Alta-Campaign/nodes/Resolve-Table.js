// Resolve Table: the launch names the table (People or Companies, required, no default); its id
// comes from the base schema just read, never from the Hub (ClayRoots Standard, law 3). The
// schema itself passes through untouched to Plan View.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const j=($input.first()||{}).json||{};
if(!D.abort){
  const tables=Array.isArray(j.tables)?j.tables:[];
  const want=String(D.table||'').trim();
  if(!tables.length){ D.abort='could not read base schema'; D.errors.push('could not read base schema for '+D.crBase+(j.error?': '+JSON.stringify(j.error).slice(0,150):'')); }
  else {
    const t=want?tables.find(x=>String(x.name||'').trim().toLowerCase()===want.toLowerCase()):null;
    if(t){ D.tableId=t.id; D.tableName=t.name; }
    else { D.abort='table not found'; D.errors.push('Base '+D.crBase+' has no '+(want||'(blank)')+' table. Scaffold the base first. Nothing was spent or written.'); }
  }
}
return [{json:j}];
