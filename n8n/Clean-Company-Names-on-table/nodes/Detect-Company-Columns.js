const cfg = $('Resolve Inputs').first().json;
const tables = [];
for (const it of $input.all()) {
  const r = it.json;
  if (Array.isArray(r.tables)) { for (const t of r.tables) tables.push(t); }
  else if (r && r.id) tables.push(r);
}
const table = tables.find(t => t && t.id === cfg.tableId);
if (!table) {
  throw new Error('Table ' + cfg.tableId + ' does not resolve in base ' + cfg.baseId + '. Nothing was written.');
}
const fields = (table.fields || []).filter(f => f && typeof f.name === 'string' && f.name.indexOf('_cc_') !== 0);
const companyField = fields.find(f => f.name === 'Company');
if (!companyField) {
  throw new Error('Table ' + (table.name || cfg.tableId) + ' (' + cfg.tableId + ') has no Company column. Nothing was written.');
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