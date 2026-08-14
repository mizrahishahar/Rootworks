const g = $('Table Guard').first().json;
const created = $('AT Create Contact Key Field').first().json || {};
const resp = $input.first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : null;
if (!tables) { throw new Error('Could not re-read the schema of base ' + g.baseId + ' after creating the Contact Key field: ' + JSON.stringify(resp).slice(0, 400) + '. Nothing was written.'); }
const target = tables.find(function (t) { return t.id === g.tableId; });
if (!target) { throw new Error('Table ' + g.tableId + ' is no longer present in base ' + g.baseId + '. Nothing was written.'); }
const have = (target.fields || []).map(function (f) { return String(f.name); });
if (have.indexOf('Contact Key') === -1) { throw new Error("Could not create the Contact Key field on '" + g.tableName + "' (" + g.tableId + '): ' + JSON.stringify(created).slice(0, 300) + '. Nothing was written.'); }
return [{ json: Object.assign({}, g, { hasContactKey: 'yes', columnCreated: true }) }];