// Check Columns: the column this machine writes must already exist on the table (Operator
// ruling 2026-09-02: a client base is set up once, by the scaffold; no working machine creates a
// column). Tag is read from the field register the push inlines as REGISTER at the @@register
// line (Companies declares it; People carries the same). Diffs by exact name against the schema
// Read Table Schema just fetched and refuses before a single row is read. A computed Tag cannot
// be written and is refused too. Then the page plan: the Build Date filter, the first page url.
// @@register
// The table itself (id, name, fields) arrives resolved by name from Resolve Table, the item in hand.
const cfg = $('Resolve Table').first().json;
const T = REGISTER.tables.find(function (x) { return x.name === 'Companies'; });
const NEED = T.fields.find(function (f) { return f.name === 'Tag'; });
if (!NEED) { throw new Error('Check Columns: the register has no field "Tag" on Companies'); }
const table = { id: cfg.tableId, name: cfg.tableName, fields: cfg.tableFields || [] };
const tableName = table.name || cfg.tableId;
const fields = table.fields || [];
const tagField = fields.find(f => f && f.name === NEED.name);
if (!tagField) {
  throw new Error('Table "' + tableName + '" (' + cfg.tableId + ') in base ' + cfg.baseId + ' is missing the columns Stamp Tag on table writes: ' + NEED.name + '. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.');
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
