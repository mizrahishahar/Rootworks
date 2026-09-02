// Resolve Table: the launch names the table (People or Companies, blank = People); its id comes
// from the schema Read Table Schema just returned (one item per table, or one item carrying
// tables[]), never from the Hub (ClayRoots Standard, law 3). Nothing here creates a table or a field.
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
const want = String(cfg.table || 'People').trim();
const table = tables.find(t => t && String(t.name || '').trim().toLowerCase() === want.toLowerCase());
if (!table) {
  throw new Error('Base ' + cfg.baseId + ' has no ' + want + ' table. Scaffold the base first. Nothing was spent or written.');
}
return [{ json: Object.assign({}, cfg, { tableId: table.id, tableName: table.name || table.id, tableFields: table.fields || [] }) }];
