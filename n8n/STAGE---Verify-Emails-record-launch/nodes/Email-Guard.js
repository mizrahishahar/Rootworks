const lg=$('Launch Gate').first().json;
const tid=lg.tableId;
const baseId=lg.baseId;
const items=$('Check Table').all().map(i=>i.json||{});
if(items.length===1 && items[0].error){ throw new Error('Airtable meta API error for base '+baseId+': '+JSON.stringify(items[0].error)); }
let tables=[];
if(items.length===1 && Array.isArray(items[0].tables)){ tables=items[0].tables; } else { tables=items; }
const t=(tables||[]).find(x=>x&&x.id===tid);
if(!t){ throw new Error('Table '+tid+' not found in base '+baseId+'.'); }
const names=(t.fields||[]).map(f=>f.name);
if(!(names.includes('Email')||names.includes('public_emails_clean'))){ throw new Error('Table "'+t.name+'" has no Email or public_emails_clean field. Aborting.'); }
return [{ json:{ table:t.name, hasEmail:true, startedAt:lg.startedAt } }];