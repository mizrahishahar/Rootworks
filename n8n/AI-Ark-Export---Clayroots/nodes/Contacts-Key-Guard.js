const r = $('Table Router').first().json;
let rows = [];
try { rows = $('AT Read Contacts').all().map(i => i.json || {}).filter(x => x && Object.keys(x).length > 0); } catch (e) { rows = []; }
const hasRows = rows.length > 0;
if (hasRows && !r.hasContactKey) { throw new Error("Target table '" + r.tableName + "' has rows but no Contact Key column. Appending contacts here would duplicate instead of dedupe. Nothing was written."); }
return [{ json: Object.assign({}, r, { fieldsCreated: [], targetHasRows: hasRows }) }];