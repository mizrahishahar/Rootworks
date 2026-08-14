const f = $input.first().json || {};
const baseId = String(f['Clayroots Base ID'] || '').trim();
const tableId = String(f['Table ID'] || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) { throw new Error('Clayroots Base ID "' + baseId + '" is not a valid Airtable base id (expected appXXXXXXXXXXXXXX). Nothing was written.'); }
if (!/^tbl[A-Za-z0-9]{14}$/.test(tableId)) { throw new Error('Table ID "' + tableId + '" is not a valid Airtable table id (expected tblXXXXXXXXXXXXXX). Nothing was written.'); }
return [{ json: { baseId: baseId, tableId: tableId, startedAt: new Date().toISOString() } }];