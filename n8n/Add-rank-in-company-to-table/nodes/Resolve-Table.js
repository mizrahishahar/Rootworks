// Resolve Table: the launch names the table (People or Companies, blank = People); its id comes
// from the base meta AT List Tables just read, never from the Hub (ClayRoots Standard, law 3).
// Nothing here creates a table or a field.
const c = $('Head Guard').first().json;
const resp = $input.first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : null;
if (!tables) { throw new Error('Could not read the table list for base ' + c.baseId + ': ' + JSON.stringify(resp).slice(0, 400) + '. Nothing was written.'); }
const want = String(c.table || 'People').trim();
const target = tables.find(function (t) { return String(t.name || '').trim().toLowerCase() === want.toLowerCase(); });
if (!target) { throw new Error('Base ' + c.baseId + ' has no ' + want + ' table. Scaffold the base first. Nothing was spent or written.'); }
return [{ json: Object.assign({}, c, { tableId: target.id, tableName: target.name }) }];
