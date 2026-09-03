// Find Companies Table: the client base must already carry a table named "Companies"
// (case-insensitive) and the Signals mirror: the synced table whose name ends with "Signals".
// Nothing here ever creates a table; the scaffold is Onboard Client's job (List Building 2.0).
// The columns, DNC and the upsert are the helper Insert domains to Clayroots' business (Operator
// ruling 2026-09-02); this node only names the table for the log and describes the mirror the
// Signals link points at. Every refusal names what is missing.
//
// The mirror row is matched on the signal's NAME (Operator ruling 2026-09-02). The previous match
// was a synced "Record ID" column, which no client base carries: all four live mirrors were
// audited and none had it, so every hiring and reviews signal died at this node. Name and Client
// ride the sync on their own, so a mirror needs nothing configured, now or at onboarding.
//
// This node builds the mirror query and Resolve Mirror Row does the strict matching. The query is
// deliberately PERMISSIVE and the code deliberately STRICT, so that a near miss arrives as a
// candidate and gets refused by name instead of silently never being seen:
//   - TRIM() so a mirror row whose Name carries stray whitespace is still a candidate.
//   - LOWER() so a case variant is still a candidate. Airtable's "=" on text is case-SENSITIVE on
//     its own, probed live against a real mirror on 2026-09-02, so without LOWER() a case-only
//     mismatch would come back as "no row at all" and cost the Operator the real diagnosis.
//     Resolve Mirror Row then applies the case-SENSITIVE rule and names what it rejected.
// Because the code re-checks exactly, any divergence between Airtable's LOWER() and JS
// toLowerCase() on exotic input can only ever cause a refusal, never a wrong match.
// No field restriction is set on the query: the mirror's Companies link column is fat and grows,
// but only matching rows are ever returned, and a "fields" list naming Client would 422 on a
// mirror that does not carry it.
//
// Reused verbatim from Insert Hiring domains to Clayroots.
const base=$('Client Vars').first().json.base;
const cfg=$('Parse Play').first().json;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was spent or written.'); }
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()==='companies');
if(!t){ throw new Error('Base '+base+' has no Companies table. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.'); }
const mirror=tables.find(x=>/signals$/i.test(String(x.name||'').trim()));
if(!mirror){ throw new Error('Base '+base+' has no Signals mirror (a synced table whose name ends with "Signals"). Sync the Hub Signals view into the client base first. Nothing was spent or written.'); }
const mirrorFields=new Set((mirror.fields||[]).map(x=>x.name));
if(!mirrorFields.has('Name')){ throw new Error('The Signals mirror '+mirror.name+' ('+mirror.id+') has no "Name" field, so a Hub signal cannot be resolved to a mirror row. Include Name in the synced Signals view first. Nothing was spent or written.'); }
const signalName=String(cfg.play_name||'').trim();
if(!signalName){ throw new Error('The Hub signal '+cfg.signal_row+' has no Name, so there is nothing to match against the Signals mirror '+mirror.name+' ('+mirror.id+') in base '+base+'. Name the Signals row first. Nothing was spent or written.'); }
const esc=signalName.toLowerCase().replace(/\\/g,'\\\\').replace(/'/g,"\\'");
return [{ json: {
  base, tableId:t.id, tableName:t.name,
  signalsTableId:mirror.id, signalsTableName:mirror.name,
  mirrorHasClient:mirrorFields.has('Client'),
  signalName,
  mirrorFilter:"LOWER(TRIM({Name})) = '"+esc+"'"
} }];
