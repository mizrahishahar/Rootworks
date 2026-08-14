const g = $('Table Guard').first().json;
const resp = $input.first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : null;
if (!tables) { throw new Error('Could not re-read the schema of base ' + g.baseId + ' after creating RankInCompany: ' + JSON.stringify(resp).slice(0, 400) + '. Nothing was written.'); }
const target = tables.find(function (t) { return t.id === g.tableId; });
if (!target) { throw new Error('Table ' + g.tableId + ' is no longer present in base ' + g.baseId + '. Nothing was written.'); }
const have = new Set((target.fields || []).map(function (f) { return f.name; }));
if (!have.has('RankInCompany')) { throw new Error("Could not create the RankInCompany field on '" + target.name + "' (" + target.id + '). Nothing was written.'); }
return [{ json: { created: true } }];