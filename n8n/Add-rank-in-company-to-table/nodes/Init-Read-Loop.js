const g = $('Check Columns').first().json;
const sd = $getWorkflowStaticData('global');
sd.ricRows = [];
sd.ricPages = 0;
delete sd.ricWrites;
delete sd.ricStats;
const viewParam = g.viewId ? ('&view=' + encodeURIComponent(g.viewId)) : '';
return [{ json: { baseId: g.baseId, tableId: g.tableId, tableName: g.tableName, viewId: g.viewId || '', viewParam: viewParam, offset: '', page: 0, done: false } }];