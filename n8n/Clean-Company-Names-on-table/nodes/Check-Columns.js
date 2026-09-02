// Check Columns: the column this machine writes must already exist on the table (Operator
// ruling 2026-09-02: a client base is set up once, by the scaffold; no working machine creates a
// column). Company is read from the field register the push inlines as REGISTER at the
// @@register line (Companies declares it; People carries the same). Diffs by exact name against
// the schema Read Table Schema just fetched and refuses before a single row is read. A computed
// Company cannot be written and is refused too. company_clean is a legacy column the register
// does not carry: written only where it exists and is writable, never required, never created.
// @@register
// The table itself (id, name, fields) arrives resolved by name from Resolve Table, the item in hand.
const cfg = $('Resolve Table').first().json;
const T = REGISTER.tables.find(function (x) { return x.name === 'Companies'; });
const NEED = T.fields.find(function (f) { return f.name === 'Company'; });
if (!NEED) { throw new Error('Check Columns: the register has no field "Company" on Companies'); }
const table = { id: cfg.tableId, name: cfg.tableName, fields: cfg.tableFields || [] };
const fields = (table.fields || []).filter(f => f && typeof f.name === 'string' && f.name.indexOf('_cc_') !== 0);
const companyField = fields.find(f => f.name === NEED.name);
if (!companyField) {
  throw new Error('Table "' + (table.name || cfg.tableId) + '" (' + cfg.tableId + ') in base ' + cfg.baseId + ' is missing the columns Clean Company Names on table writes: ' + NEED.name + '. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.');
}
const COMPUTED = ['formula','rollup','count','lookup','multipleLookupValues','aiText','autoNumber','createdTime','lastModifiedTime','createdBy','lastModifiedBy','button','externalSyncSource','barcode'];
if (COMPUTED.indexOf(companyField.type) > -1) {
  throw new Error('The Company column on ' + (table.name || cfg.tableId) + ' is a computed field (' + companyField.type + ') and cannot be written. Nothing was written.');
}
const cleanField = fields.find(f => f.name === 'company_clean') || null;
const cleanWritable = !!cleanField && COMPUTED.indexOf(cleanField.type) === -1;
let cleanNote;
if (!cleanField) { cleanNote = 'company_clean is absent on this table, wrote Company only'; }
else if (!cleanWritable) { cleanNote = 'company_clean is computed on this table (' + cleanField.type + '), wrote Company only'; }
else { cleanNote = 'wrote Company and company_clean'; }
const s = $getWorkflowStaticData('global');
s.ccn = s.ccn || {};
s.ccn[$execution.id] = { scanned: 0, changed: 0, unchanged: 0, blank: 0, quarantined: 0, pipe: 0, dash: 0, legal: 0, symbol: 0, pages: 0, batches: 0 };
const url = 'https://api.airtable.com/v0/' + cfg.baseId + '/' + cfg.tableId + '?pageSize=100';
return [{ json: { baseId: cfg.baseId, tableId: cfg.tableId, tableName: table.name || cfg.tableId, companyField: 'Company', cleanField: cleanField ? 'company_clean' : '', cleanType: cleanField ? cleanField.type : '', cleanWritable, cleanNote, pageUrl: url, more: true } }];
