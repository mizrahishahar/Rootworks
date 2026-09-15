// Verify Columns: the base meta read again after the creates. Every profile column must now show
// on People; anything still missing stops the run by name before a row is read (a crash here is a
// real defect: the meta API accepted a create it did not perform).
const c=$('Check Columns').first().json;
const r=$input.first().json||{}; const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables) throw new Error('Could not re-read the table list for base '+c.base+' after creating columns on People: '+JSON.stringify(body).slice(0,200)+'. Nothing was asked.');
const names=new Set((((tables.find(t=>t.id===c.tableId))||{}).fields||[]).map(f=>f.name));
const still=(c.toCreate||[]).filter(n=>!names.has(n));
if(still.length){ let why=''; try{ why=$('Create Columns').all().map(i=>JSON.stringify(i.json).slice(0,200)).join(' | '); }catch(e){} throw new Error('Enrich Person Profile created columns People does not show: '+still.join(', ')+'. Airtable answered: '+why+'. Nothing was asked.'); }
return [{ json:{ created:(c.toCreate||[]).slice() } }];
