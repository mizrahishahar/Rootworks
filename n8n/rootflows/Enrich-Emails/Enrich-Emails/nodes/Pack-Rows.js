// Pack Rows: every row of the view, each carrying the run context the batch sub-execution needs
// (Params and Resolve Table do not exist inside a sub-execution). One row = one person to resolve.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
const rows=$input.all().map(i=>i.json).filter(j=>j&&j.id);
const ctx={ _baseId:p.base, _tableId:t.tableId, _tableName:t.tableName, _view:t.viewName, _execId:String($execution.id), _startedAt:p.startedAt, _clientId:p.clientRecId||'', _trigger:p.trigger||'form', _total:rows.length, _tag:p.tag||'' };
return rows.map(j=>({ json:Object.assign({}, j, ctx) }));
