// Verify Columns: the base meta read again after the creates. Every open field must now show
// on Companies and, as its lookup, on People; anything still missing stops the run by name,
// before any row is written.
const c=$('Check Columns').first().json;
const r=$input.first().json||{}; const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not re-read the table list for base '+c.base+' after creating columns: '+JSON.stringify(body).slice(0,200)+'. Nothing was written.'); }
const cn=new Set((((tables.find(t=>t.id===c.tableId))||{}).fields||[]).map(f=>f.name));
const pn=new Set((((tables.find(t=>t.id===c.peopleTableId))||{}).fields||[]).map(f=>f.name));
const still=[];
for(const n of c.toCreate){ if(!cn.has(n)) still.push(n+' on Companies'); if(!pn.has(n)) still.push(n+' on People'); }
if(still.length){ throw new Error('Insert domains to Clayroots created columns the base does not show: '+still.join(', ')+'. Nothing was written.'); }
return [{ json: { created: c.toCreate.slice() } }];
