const g = $('Guard Input').first().json;
const resp = $input.first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : null;
if (!tables) { throw new Error('Could not read the table list for base ' + g.baseId + ': ' + JSON.stringify(resp).slice(0, 400) + '. Nothing was written.'); }
const target = tables.find(function (t) { return t.id === g.tableId; });
if (!target) { throw new Error('Table ' + g.tableId + ' does not exist in base ' + g.baseId + '. Tables there: ' + tables.map(function (t) { return t.name; }).join(', ') + '. Nothing was written.'); }
const name = String(target.name == null ? '' : target.name);
if (/domains/i.test(name)) { throw new Error("'" + name + "' is a domains table. Contact Key does not belong there. Nothing was written."); }
const fieldNames = (target.fields || []).map(function (f) { return String(f.name); });
const has = function (n) { return fieldNames.indexOf(n) > -1; };
if (!has('Domain')) { throw new Error("'" + name + "' has no Domain field, so a Contact Key cannot be derived. Nothing was written."); }
const hasSplit = has('first_name') && has('last_name');
const hasName = has('Name');
if (!hasSplit && !hasName) { throw new Error("'" + name + "' has no first_name/last_name and no Name field, so a Contact Key cannot be derived. Nothing was written."); }
return [{ json: { baseId: g.baseId, tableId: g.tableId, tableName: name, nameSource: hasSplit ? 'first_name+last_name' : 'Name', hasContactKey: has('Contact Key') ? 'yes' : 'no', columnCreated: false } }];