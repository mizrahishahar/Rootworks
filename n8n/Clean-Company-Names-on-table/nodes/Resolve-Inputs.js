const i = $input.first().json;
const baseId = String(i.baseId || '').trim();
const tableId = String(i.tableId || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) {
  throw new Error('Clayroots Base ID ' + baseId + ' is not a valid base id. Nothing was written.');
}
if (!/^tbl[A-Za-z0-9]{14}$/.test(tableId)) {
  throw new Error('Table ID ' + tableId + ' is not a valid table id. Nothing was written.');
}
return [{ json: { baseId, tableId, launchRecordId: String(i.launchRecordId || ''), triggerKind: String(i.triggerKind || 'form'), startedAt: new Date().toISOString() } }];