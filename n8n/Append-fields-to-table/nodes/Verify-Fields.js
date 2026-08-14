const g=$('Guard Schema').first().json;
const tables=($input.first().json.tables)||[];
const table=tables.find(t=>t.id===g.tableId);
const names=((table&&table.fields)||[]).map(f=>f.name);
const still=g.attrCols.filter(c=>!names.includes(c));
if(still.length>0){ throw new Error('Field creation failed: these CSV columns are still missing on the table after create: '+still.join(', ')+'. No row was modified.'); }
return [{ json: { fieldsVerified: true, created: g.missingFields } }];