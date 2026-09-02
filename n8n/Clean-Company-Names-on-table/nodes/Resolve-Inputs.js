const i = $input.first().json;
const baseId = String(i.baseId || '').trim();
// The table is named (People or Companies, blank = People); Resolve Table turns the name into the id.
const table = String(i.table || '').trim() || 'People';
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) {
  throw new Error('Clayroots Base ID ' + baseId + ' is not a valid base id. Nothing was written.');
}
return [{ json: { baseId, table, launchRecordId: String(i.launchRecordId || ''), triggerKind: String(i.triggerKind || 'form'), startedAt: new Date().toISOString() } }];