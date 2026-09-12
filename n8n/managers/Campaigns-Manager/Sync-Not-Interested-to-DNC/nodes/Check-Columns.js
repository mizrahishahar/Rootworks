// Check Columns: the client's DNC table, resolved by name from the base schema Get CR Schema just
// fetched (never from the Hub), must carry the four register fields this machine writes: Domain,
// Reason, Added, Notes. The names come from the field register the push inlines as REGISTER at the
// @@register line. A base with no DNC table, or a DNC table missing a column, is this client's error
// line; nothing of theirs is written and the loop serves the next client. Never creates a column
// (Operator ruling 2026-09-02: a client base is set up once, by the scaffold).
// @@register
const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const j=($input.first()||{}).json||{};
const tables=Array.isArray(j.tables)?j.tables:[];
const T=REGISTER.tables.find(x=>x.name==='DNC');
const NEED=['Domain','Reason','Added','Notes'].map(n=>{ const f=T.fields.find(x=>x.name===n); if(!f) throw new Error('Check Columns: the register has no field "'+n+'" on DNC'); return f.name; });
if(!tables.length){
  c.errors.push('Base '+c.crBase+': schema fetch failed or the base has no tables: '+JSON.stringify(j).slice(0,200)+'. Nothing was written.');
  return [{ json:{ _skip:true } }];
}
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()==='dnc');
if(!t){
  c.errors.push('Base '+c.crBase+' has no DNC table. Scaffold the base (Scaffold Client Base) first. Nothing was written.');
  return [{ json:{ _skip:true } }];
}
const have=new Set((t.fields||[]).map(f=>f.name));
const missing=NEED.filter(n=>!have.has(n));
if(missing.length){
  c.errors.push('Table "'+t.name+'" ('+t.id+') in base '+c.crBase+' is missing the columns Sync Not Interested to DNC writes: '+missing.join(', ')+'. Scaffold the base (Scaffold Client Base) first. Nothing was written.');
  return [{ json:{ _skip:true } }];
}
c.dncTableId=t.id;
c.dncTableName=t.name;
return [{ json:{ clientRecId:sd.currentClient, ws:c.ws, crBase:c.crBase, dncTableId:t.id } }];
