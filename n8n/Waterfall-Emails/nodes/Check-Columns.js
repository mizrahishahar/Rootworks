// Check Columns: the email lane this machine writes must already exist on the People table
// (Operator ruling 2026-09-02: a client base is set up once, by the scaffold; no working machine
// creates a column). The lane is read from the field register, inlined by the push as REGISTER
// at the @@register line: the full lane by name, as People declares it (Waterfall Emails runs on
// People only; Resolve Table refused a Companies launch before this). Diffs by exact name against
// the schema Resolve Table already read and refuses before the first paid call when anything is
// missing. A lane name the register does not carry on People is a register defect and fails here,
// never as a silent pass.
// @@register
const LANE=['MV P0','P1 (Trykitt)','MV P1','P2 (LeadMagic)','MV P2','P3 (Prospeo)','MV P3','BB','Final Email','Email Source','Status'];
const T=REGISTER.tables.find(x=>x.name==='People');
if(!T) throw new Error('Check Columns: the register has no People table');
const NEEDS=LANE.map(n=>{ const f=T.fields.find(x=>x.name===n); if(!f) throw new Error('Check Columns: the register has no lane field "'+n+'" on People'); return f.name; });
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const have=new Set(t.fieldNames||[]);
const missing=NEEDS.filter(n=>!have.has(n));
if(missing.length){ throw new Error('Table "'+t.tableName+'" ('+t.tableId+') in base '+p['Clayroots Base ID']+' is missing the columns Waterfall Emails writes: '+missing.join(', ')+'. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.'); }
return [{ json: $('Email Guard').first().json }];
