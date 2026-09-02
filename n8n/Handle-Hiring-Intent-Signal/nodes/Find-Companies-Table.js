// Find Companies Table: the client base must already carry a table named "Companies"
// (case-insensitive) with the register's core fields, and the Signals mirror: the synced
// table whose name ends with "Signals", carrying the Hub Record ID. Nothing here ever creates
// a table; the scaffold is Onboard Client's job (List Building 2.0). DNC is optional: its
// absence means nothing to suppress. Every refusal names what is missing; nothing is written.
const base=$('Client Vars').first().json.base;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was spent or written.'); }
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()==='companies');
if(!t){ throw new Error('Base '+base+' has no Companies table. Scaffold the client base to the List Building 2.0 standard first. Nothing was spent or written.'); }
const names=new Set((t.fields||[]).map(x=>x.name));
for(const need of ['Domain','Company','Domain Source','Tag','Signals','Signal At','ICP Reason']){ if(!names.has(need)){ throw new Error('Companies table '+t.id+' is missing the core field "'+need+'". Bring it to the register first. Nothing was spent or written.'); } }
const mirror=tables.find(x=>/signals$/i.test(String(x.name||'').trim()));
if(!mirror){ throw new Error('Base '+base+' has no Signals mirror (a synced table whose name ends with "Signals"). Sync the Hub Signals view into the client base first. Nothing was spent or written.'); }
const mirrorFields=new Set((mirror.fields||[]).map(x=>x.name));
if(!mirrorFields.has('Record ID')){ throw new Error('The Signals mirror '+mirror.name+' ('+mirror.id+') has no "Record ID" field, so a Hub signal cannot be resolved to a mirror row. Add the Hub Record ID formula to the synced view first. Nothing was spent or written.'); }
const dnc=tables.find(x=>String(x.name||'').trim().toLowerCase()==='dnc');
return [{ json: { base, tableId:t.id, tableName:t.name, fieldNames:Array.from(names), signalsTableId:mirror.id, signalsTableName:mirror.name, dncTableId:dnc?dnc.id:'' } }];
