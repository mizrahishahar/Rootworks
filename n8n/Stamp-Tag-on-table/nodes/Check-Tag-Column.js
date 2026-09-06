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
const tableName = table.name || cfg.tableId;
const fields = table.fields || [];
const tagField = fields.find(f => f && f.name === 'Tag');
if (!tagField) {
  throw new Error('Table ' + tableName + ' (' + cfg.tableId + ') in base ' + cfg.baseId + ' has no Tag column. This automation never creates fields: add the Tag column by hand, then re-run. Nothing was written.');
}
const COMPUTED = ['formula','rollup','count','lookup','multipleLookupValues','aiText','autoNumber','createdTime','lastModifiedTime','createdBy','lastModifiedBy','button','externalSyncSource','barcode'];
if (COMPUTED.indexOf(tagField.type) > -1) {
  throw new Error('The Tag column on ' + tableName + ' (' + cfg.tableId + ') is a computed field (' + tagField.type + ') and cannot be written. Nothing was written.');
}
let formula = '';
let filterNote = 'whole table, no Build Date filter';
if (cfg.buildDate) {
  const bd = fields.find(f => f && f.name === 'Build Date');
  if (!bd) {
    throw new Error('A Build Date filter of ' + cfg.buildDate + ' was requested but table ' + tableName + ' (' + cfg.tableId + ') has no Build Date column. Nothing was written.');
  }
  formula = "IS_SAME({Build Date}, DATETIME_PARSE('" + cfg.buildDate + "', 'YYYY-MM-DD'), 'day')";
  filterNote = 'rows whose Build Date falls on ' + cfg.buildDate + ' (UTC day, date-mode comparison)';
}
const s = $getWorkflowStaticData('global');
s.stt = s.stt || {};
s.stt[$execution.id] = { scanned: 0, changed: 0, unchanged: 0, filled: 0, overwritten: 0, pages: 0, batches: 0 };
const baseUrl = 'https://api.airtable.com/v0/' + cfg.baseId + '/' + cfg.tableId + '?pageSize=100&fields%5B%5D=Tag' + (formula ? '&filterByFormula=' + encodeURIComponent(formula) : '');
return [{ json: { baseId: cfg.baseId, tableId: cfg.tableId, tableName, tag: cfg.tag, buildDate: cfg.buildDate, tagFieldType: tagField.type, formula, filterNote, baseUrl, pageUrl: baseUrl, more: true } }];