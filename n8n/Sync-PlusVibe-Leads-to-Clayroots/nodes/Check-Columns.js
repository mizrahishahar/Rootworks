// Check Columns: the machine fields this sync writes must already exist on every target table
// (Operator ruling 2026-09-02: a client base is set up once, by the scaffold; no working machine
// creates a column). They are read from the field register the push inlines as REGISTER at the
// @@register line: the machine fields by name; the Campaigns link only when the base carries the
// campaigns mirror (without it the link is skipped with a warning, as before). Target tables are
// the ones carrying a text Final Email. Diffs by exact name against the schema Get CR Schema
// fetched and refuses this client's write phase before a single row is touched: the refusal is
// the client's error line in the run log (Succeeded with errors, watermark held) and no table
// of that client is written; the other clients in the loop are served.
// @@register
const MACHINE=['Messages Sent','Last Contacted','Campaign Status','Bounce Reason','Synced At'];
const T=REGISTER.tables.find(x=>x.name==='Companies');
const need=(names)=>names.map(n=>{ const f=T.fields.find(x=>x.name===n); if(!f) throw new Error('Check Columns: the register has no field "'+n+'" on Companies'); return f.name; });
const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const j=($input.first()||{}).json||{};
const tables=Array.isArray(j.tables)?j.tables:[];
if(!tables.length){ c.errors.push('schema fetch failed or base has no tables'); c.writeOk=false; return [{json:{_none:true}}]; }
const mirror=tables.find(t=>{ const names=new Set((t.fields||[]).map(f=>f.name)); return !names.has('Final Email') && names.has('Campaign ID') && names.has('Sequencer'); });
c.mirrorId=mirror?mirror.id:'';
const want=need(MACHINE.concat(mirror?['Campaigns']:[]));
const refusals=[];
for(const t of tables){
  const fe=(t.fields||[]).find(f=>f.name==='Final Email');
  if(!fe) continue;
  if(fe.type!=='singleLineText' && fe.type!=='email'){ c.skippedTables.push(t.name+' (Final Email is '+fe.type+')'); continue; }
  const have=new Set((t.fields||[]).map(f=>f.name));
  const missing=want.filter(n=>!have.has(n));
  if(missing.length){ refusals.push('table "'+t.name+'" ('+t.id+') is missing '+missing.join(', ')); continue; }
  c.targetTables.push({id:t.id, name:t.name});
  c.updates[t.name]=0;
}
if(refusals.length){
  c.errors.push('Base '+c.crBase+': '+refusals.join('; ')+': the columns Sync PlusVibe Leads to Clayroots writes. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.');
  c.writeOk=false;
  c.targetTables=[]; c.updates={};
} else if(!c.targetTables.length){ c.errors.push('no target tables with Final Email found in base'); c.writeOk=false; }
if(!mirror) c.warnings.push('no campaigns mirror table (Campaign ID + Sequencer fields, no Final Email); Campaigns link skipped');
return [{json:{clientRecId:sd.currentClient, tables:c.targetTables.length, mirrorId:c.mirrorId||''}}];
