// Check Columns: the lane columns this machine writes must already exist on the target table
// (Operator ruling 2026-09-02: a client base is set up once, by the scaffold; no working machine
// creates a column). The lane is read from the field register, inlined by the push as REGISTER
// at the @@register line, on the register table the launch named. Companies carries the short
// lane, exactly five: Email (the address verified, written when it came from
// public_emails_clean), MV P0, BB, Final Email, Status; nothing else is asked for or written
// there. People carries today's full lane; MV P1..P3 are not required: Verdict writes the tier
// column only when the table carries it and falls back to MV P0. Diffs by exact name against the
// schema Resolve Table already read and refuses before the first paid call when anything is
// missing. A lane name the register does not carry on that table is a register defect and fails
// here, never as a silent pass.
// @@register
const t=$('Resolve Table').first().json;
const p=$('Params In').first().json;
const LANES={ companies:['Email','MV P0','BB','Final Email','Status'], people:['MV P0','BB','Final Email','Email Source','Status'] };
const lane=t.lane==='companies'?'companies':'people';
const T=REGISTER.tables.find(x=>String(x.name).toLowerCase()===lane);
if(!T) throw new Error('Check Columns: the register has no '+lane+' table');
const NEEDS=LANES[lane].map(n=>{ const f=T.fields.find(x=>x.name===n); if(!f) throw new Error('Check Columns: the register has no lane field "'+n+'" on '+T.name); return f.name; });
const have=new Set(t.fieldNames||[]);
const missing=NEEDS.filter(n=>!have.has(n));
if(missing.length){ throw new Error('Table "'+t.tableName+'" ('+t.tableId+') in base '+p['Clayroots Base ID']+' is missing the columns Verify Emails writes: '+missing.join(', ')+'. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.'); }
return [{ json: $('Email Guard').first().json }];
