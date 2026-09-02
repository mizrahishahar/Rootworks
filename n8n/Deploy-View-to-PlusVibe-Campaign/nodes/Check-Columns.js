// Check Columns: the columns this door writes back onto the source table must already exist
// (Operator ruling 2026-09-02: a client base is set up once, by the scaffold; no working machine
// creates a column). They are the register's machine fields, read from the field register the
// push inlines as REGISTER at the @@register line, on the register table the launch named
// (People or Companies; both carry them): Deploy Error on every deployed or skipped row;
// Campaigns, the link to the client's Campaigns mirror, only when the base carries the mirror
// (without it the door warns and stamps no link, as before). Diffs by exact name against the
// field names Plan Variables took from the schema and refuses before a single lead is sent. An
// aborted launch passes through untouched: Finalize Launch writes its row. The refusal clears
// this run's static-data slot first, so a crash here leaves nothing behind.
// @@register
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const p=$input.first().json||{};
if(D&&!D.abort){
  const want=String(D.tableName||D.table||'').trim().toLowerCase();
  const T=REGISTER.tables.find(x=>String(x.name).toLowerCase()===want)||REGISTER.tables.find(x=>x.name==='People');
  const NEEDS=['Deploy Error'].concat(p.mirrorTableId?['Campaigns']:[]).map(n=>{ const f=T.fields.find(x=>x.name===n); if(!f) throw new Error('Check Columns: the register has no field "'+n+'" on '+T.name); return f.name; });
  const have=new Set(p.fieldNames||[]);
  const missing=NEEDS.filter(n=>!have.has(n));
  if(missing.length){
    const msg='Table "'+(D.tableName||p.tableId)+'" ('+p.tableId+') in base '+p.crBase+' is missing the columns Deploy View to PlusVibe Campaign writes: '+missing.join(', ')+'. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.';
    sd[dk]=null;
    throw new Error(msg);
  }
}
return [{json:p}];
