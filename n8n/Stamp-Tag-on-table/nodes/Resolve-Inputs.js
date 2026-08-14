const i = $input.first().json;
const baseId = String(i.baseId || '').trim();
const tableId = String(i.tableId || '').trim();
const tag = String(i.tag || '').trim();
const buildDate = String(i.buildDate || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) {
  throw new Error('Clayroots Base ID ' + baseId + ' is not a valid base id. Nothing was written.');
}
if (!/^tbl[A-Za-z0-9]{14}$/.test(tableId)) {
  throw new Error('Table ID ' + tableId + ' is not a valid table id. Nothing was written.');
}
if (!tag) {
  throw new Error('No Tag value was supplied for table ' + tableId + '. The Tag is the whole point of this run. Nothing was written.');
}
if (buildDate && !/^\d{4}-\d{2}-\d{2}$/.test(buildDate)) {
  throw new Error('Build Date filter ' + buildDate + ' is not an ISO date in the form YYYY-MM-DD. Nothing was written.');
}
return [{ json: { baseId, tableId, tag, buildDate, launchRecordId: String(i.launchRecordId || ''), triggerKind: String(i.triggerKind || 'form'), startedAt: new Date().toISOString() } }];