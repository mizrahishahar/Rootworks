const g = $input.first().json || {};
const sd = $getWorkflowStaticData('global');
sd.ackState = { rowsScanned: 0, keysWritten: 0, alreadyHadKey: 0, skippedNoDomain: 0, skippedNoName: 0, writeFailures: 0, dupCount: 0, dupSamples: [], pages: 0, keys: {} };
const fetchFields = ['Domain', 'Contact Key'];
if (g.nameSource === 'first_name+last_name') { fetchFields.push('first_name'); fetchFields.push('last_name'); } else { fetchFields.push('Name'); }
return [{ json: { baseId: g.baseId, tableId: g.tableId, tableName: g.tableName, nameSource: g.nameSource, columnCreated: !!g.columnCreated, fetchFields: fetchFields, query: { pageSize: 100, 'fields[]': fetchFields } } }];