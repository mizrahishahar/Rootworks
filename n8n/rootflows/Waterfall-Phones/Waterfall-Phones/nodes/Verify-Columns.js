// Verify Columns: the base meta read again after the creates. Every own field must now show;
// anything still missing stops the run by name before a row is read and before a provider is called.
const c=$('Check Columns').first().json;
const r=$input.first().json||{}; const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables) throw new Error('Could not re-read the table list for base '+c.base+' after creating columns: '+JSON.stringify(body).slice(0,200)+'.');
const names=new Set((((tables.find(t=>t.id===c.tableId))||{}).fields||[]).map(f=>f.name));
const still=(c.toCreate||[]).filter(n=>!names.has(n));
if(still.length) throw new Error('Enrich Phones created columns the base does not show: '+still.join(', ')+'. No provider was called.');
return [{ json:{ created:c.toCreate.slice() } }];
