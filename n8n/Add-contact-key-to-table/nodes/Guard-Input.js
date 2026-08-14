const src = $input.first().json || {};
const baseId = String(src['Clayroots Base ID'] == null ? '' : src['Clayroots Base ID']).trim();
const tableId = String(src['Table ID'] == null ? '' : src['Table ID']).trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) { throw new Error('Clayroots Base ID "' + baseId + '" is not a valid Airtable base id (expected app followed by 14 characters). Nothing was written.'); }
if (!/^tbl[A-Za-z0-9]{14}$/.test(tableId)) { throw new Error('Table ID "' + tableId + '" is not a valid Airtable table id (expected tbl followed by 14 characters). Nothing was written.'); }
const launchRecordId = String(src._launchRecordId == null ? '' : src._launchRecordId).trim();
return [{ json: { baseId: baseId, tableId: tableId, launchRecordId: launchRecordId, trigger: launchRecordId ? 'record' : 'form', startedAt: src.submittedAt || $now.toISO() } }];