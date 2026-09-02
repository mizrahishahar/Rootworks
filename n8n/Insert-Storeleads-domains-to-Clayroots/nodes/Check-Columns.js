// Check Columns: every column this machine writes must already exist on Companies (Operator
// ruling 2026-09-02: a client base is set up once, by the scaffold; no working machine creates a
// column). The definitions come from the field register, inlined by the push as REGISTER at the
// @@register line: the register core Process Batch maps, by name, plus the Storeleads declared
// extras, by group (the scaffold creates them when Storeleads is picked on its launch row).
// Diffs by exact name against the schema Find Companies Table already resolved and refuses
// before the first paid call. A declared extra that exists under another type is refused too: it
// can be neither created nor written. Emits the write contract for the batches: the table id,
// its name, and the exact field-name list the upsert may write.
// @@register
const CORE=['Domain','Company','Description','Industry Groups','Employees','Country','State','City','Public Emails','public_emails_clean','MX Provider','Domain Source','Tag'];
const GROUP='Storeleads';
const T=REGISTER.tables.find(x=>x.name==='Companies');
const core=CORE.map(n=>{ const f=T.fields.find(x=>x.name===n); if(!f) throw new Error('Check Columns: the register has no field "'+n+'" on Companies'); return f.name; });
const g=(REGISTER.extras||[]).find(x=>x.group===GROUP);
if(!g) throw new Error('Check Columns: the register has no extras group "'+GROUP+'"');
const OK={ singleLineText:['singleLineText','multilineText','richText','url'], multilineText:['multilineText','richText','singleLineText'], number:['number','currency','percent'], dateTime:['dateTime','date'], date:['date','dateTime'], url:['url','singleLineText'] };
const cfg=$('Find Companies Table').first().json;
const byName=new Map((cfg.fieldTypes||[]).map(f=>[f.name,f.type]));
const missing=core.filter(n=>!byName.has(n)).concat(g.fields.filter(f=>!byName.has(f.name)).map(f=>f.name));
if(missing.length){ throw new Error('Table "'+cfg.tableName+'" ('+cfg.tableId+') in base '+cfg.base+' is missing the columns Insert Storeleads domains to Clayroots writes: '+missing.join(', ')+'. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.'); }
const clashes=g.fields.filter(f=>!(OK[f.type]||[f.type]).includes(byName.get(f.name))).map(f=>f.name+' (in table: '+byName.get(f.name)+', expected: '+f.type+')');
if(clashes.length){ throw new Error('Table "'+cfg.tableName+'" ('+cfg.tableId+') in base '+cfg.base+' cannot take the '+GROUP+' extras: '+clashes.join('; ')+'. Fix the column first. Nothing was spent or written.'); }
return [{ json: { base: cfg.base, tableId: cfg.tableId, tableName: cfg.tableName, fieldNames: cfg.fieldNames } }];
