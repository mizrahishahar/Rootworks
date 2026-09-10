// Verify Columns: the base meta read again after the creates; anything still missing stops the run.
const c=$('Check Columns').first().json;
const r=$input.first().json||{}; const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables) throw new Error('Could not re-read the table list for base '+c.base+' after creating columns.');
const names=new Set((((tables.find(t=>t.id===c.tableId))||{}).fields||[]).map(f=>f.name));
const still=(c.toCreate||[]).filter(n=>!names.has(n));
if(still.length) throw new Error('Verify Catch-alls created columns the base does not show: '+still.join(', ')+'.');
return [{ json:{ created:c.toCreate.slice() } }];
