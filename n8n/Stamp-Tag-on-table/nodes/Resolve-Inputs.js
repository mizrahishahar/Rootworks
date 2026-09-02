const i = $input.first().json;
const baseId = String(i.baseId || '').trim();
// The table is named (People or Companies, blank = People). A legacy tableId from the query door is
// honoured for one release when no name came with it. Resolve Table turns either into the id.
const table = String(i.table || '').trim();
const tableId = String(i.tableId || '').trim();
const tag = String(i.tag || '').trim();
const buildDate = String(i.buildDate || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) {
  throw new Error('Clayroots Base ID ' + baseId + ' is not a valid base id. Nothing was written.');
}
if (!table && tableId && !/^tbl[A-Za-z0-9]{14}$/.test(tableId)) {
  throw new Error('tableId ' + tableId + ' is not a valid table id. Pass table (People or Companies) instead. Nothing was written.');
}
if (!tag) {
  throw new Error('No Tag value was supplied for table ' + (table || tableId || 'People') + '. The Tag is the whole point of this run. Nothing was written.');
}
if (buildDate && !/^\d{4}-\d{2}-\d{2}$/.test(buildDate)) {
  throw new Error('Build Date filter ' + buildDate + ' is not an ISO date in the form YYYY-MM-DD. Nothing was written.');
}
return [{ json: { baseId, table: table || (tableId ? '' : 'People'), tableId: table ? '' : tableId, tag, buildDate, launchRecordId: String(i.launchRecordId || ''), triggerKind: String(i.triggerKind || 'form'), startedAt: new Date().toISOString() } }];