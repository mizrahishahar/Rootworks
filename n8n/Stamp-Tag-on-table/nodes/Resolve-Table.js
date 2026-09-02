// Resolve Table: the launch names the table (People or Companies, blank = People); its id comes
// from the schema Read Table Schema just returned (one item per table, or one item carrying
// tables[]), never from the Hub (ClayRoots Standard, law 3). A legacy tableId from the query door
// is resolved by id for one release. Nothing here creates a table or a field.
const cfg = $('Resolve Inputs').first().json;
const tables = [];
for (const it of $input.all()) {
  const r = it.json;
  if (Array.isArray(r.tables)) { for (const t of r.tables) tables.push(t); }
  else if (r && r.id) tables.push(r);
}
if (!tables.length) {
  throw new Error('Could not read the table list for base ' + cfg.baseId + '. Nothing was written.');
}
const byName = (n) => tables.find(t => t && String(t.name || '').trim().toLowerCase() === String(n).trim().toLowerCase());
let table = null;
if (cfg.table) {
  table = byName(cfg.table);
  if (!table) { throw new Error('Base ' + cfg.baseId + ' has no ' + cfg.table + ' table. Scaffold the base first. Nothing was spent or written.'); }
} else if (cfg.tableId) {
  table = tables.find(t => t && t.id === cfg.tableId);
  if (!table) { throw new Error('Table ' + cfg.tableId + ' (legacy tableId) is not in base ' + cfg.baseId + '. Pass table (People or Companies) instead. Nothing was written.'); }
} else {
  table = byName('People');
  if (!table) { throw new Error('Base ' + cfg.baseId + ' has no People table. Scaffold the base first. Nothing was spent or written.'); }
}
return [{ json: Object.assign({}, cfg, { tableId: table.id, tableName: table.name || table.id, tableFields: table.fields || [] }) }];
