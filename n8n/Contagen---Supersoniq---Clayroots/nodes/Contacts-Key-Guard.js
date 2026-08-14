const r = $('Table Router').first().json;
let rows = [];
try { rows = $('AT Read Contacts').all().map(i => i.json || {}).filter(x => x && x.id); } catch (e) { rows = []; }
const n = rows.length >= 100 ? '100+' : String(rows.length);
if (!r.hasContactKey && rows.length > 0) { throw new Error("Target table '" + r.tableName + "' has " + n + " rows but no Contact Key column. Appending contacts here would duplicate instead of dedupe. Nothing was written."); }
return [{ json: Object.assign({}, r, { fieldsCreated: [], rowsProbed: n }) }];