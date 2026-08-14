const g=$('Guard Schema').first().json;
const items=$input.all();
const zero=items.length===1 && items[0].json && items[0].json._zeroMatch===true;
let rowsMatched=0, rowsUpdated=0, writeFailures=0, tableRowsScanned=0;
if(zero){ tableRowsScanned=items[0].json._tableRowsScanned||0; }
else {
  const failed=items.filter(i=>i.json&&i.json.error);
  writeFailures=failed.length;
  rowsMatched=items.length;
  rowsUpdated=items.length-writeFailures;
  if(rowsUpdated===0){ throw new Error('All '+items.length+' row updates failed. First error: '+JSON.stringify(failed[0]&&failed[0].json.error)); }
  tableRowsScanned=$('Get Table Rows').all().length;
}
const matched={};
if(!zero){ for(const it of $('Get Table Rows').all()){ const f=it.json.fields||{}; const k=String(f[g.keyName]||'').trim().toLowerCase(); if(k&&g.lookup[k]) matched[k]=true; } }
const unmatched=Object.keys(g.lookup).filter(k=>!matched[k]);
return [{ json: { baseId: g.baseId, tableId: g.tableId, tableName: g.tableName, keyName: g.keyName, fieldsRequested: g.fieldsRequested||[], fieldsSkipped: g.fieldsSkipped||[], launchedVia: g.launchedVia, startedAt: g.startedAt, headerNote: g.headerNote, csvRows: g.csvRows, distinctKeys: g.distinctKeys, dupKeys: g.dupKeys, fieldsAppended: g.attrCols, fieldsCreated: g.missingFields, tableRowsScanned, rowsMatched, rowsUpdated, writeFailures, unmatchedCount: unmatched.length, unmatchedSample: unmatched.slice(0, 20), zeroMatch: zero } }];