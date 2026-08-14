const f=$input.first().json;
const baseId=String(f['Source Base ID']||'').trim();
const tableId=String(f['Source Table ID']||'').trim();
if(!/^app[A-Za-z0-9]{14}$/.test(baseId)){ throw new Error('Head guard: Source Base ID "'+baseId+'" is not a valid Airtable base id (appXXXXXXXXXXXXXX). Nothing was written.'); }
if(!/^tbl[A-Za-z0-9]{14}$/.test(tableId)){ throw new Error('Head guard: Source Table ID "'+tableId+'" is not a valid Airtable table id (tblXXXXXXXXXXXXXX). Nothing was written.'); }
return [{ json: { baseId, tableId, startedAt: new Date().toISOString() } }];