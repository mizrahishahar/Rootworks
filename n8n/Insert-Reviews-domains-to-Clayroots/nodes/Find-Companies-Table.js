// Find Companies Table: the client base must already carry a table named "Companies"
// (case-insensitive) and the Signals mirror: the synced table whose name ends with "Signals",
// carrying the Hub Record ID. Nothing here ever creates a table; the scaffold is Onboard
// Client's job (List Building 2.0). The columns, DNC and the upsert are the helper Insert
// domains to Clayroots' business (Operator ruling 2026-09-02); this node only names the table
// for the log and resolves the mirror the Signals link points at. Every refusal names what is missing.
// Reused verbatim from Insert Hiring domains to Clayroots.
const base=$('Client Vars').first().json.base;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was spent or written.'); }
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()==='companies');
if(!t){ throw new Error('Base '+base+' has no Companies table. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.'); }
const mirror=tables.find(x=>/signals$/i.test(String(x.name||'').trim()));
if(!mirror){ throw new Error('Base '+base+' has no Signals mirror (a synced table whose name ends with "Signals"). Sync the Hub Signals view into the client base first. Nothing was spent or written.'); }
const mirrorFields=new Set((mirror.fields||[]).map(x=>x.name));
if(!mirrorFields.has('Record ID')){ throw new Error('The Signals mirror '+mirror.name+' ('+mirror.id+') has no "Record ID" field, so a Hub signal cannot be resolved to a mirror row. Add the Hub Record ID formula to the synced view first. Nothing was spent or written.'); }
return [{ json: { base, tableId:t.id, tableName:t.name, signalsTableId:mirror.id, signalsTableName:mirror.name } }];
