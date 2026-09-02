// Resolve Table: the launch names the table (People or Companies, blank = People); its id comes
// from the base meta Check Table just read, never from the Hub (ClayRoots Standard, law 3).
// Nothing here creates a table or a field.
const p=$('Params In').first().json;
const baseId=p['Clayroots Base ID'];
const resp=$('Check Table').first().json||{};
const tables=Array.isArray(resp.tables)?resp.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+baseId+': '+JSON.stringify(resp).slice(0,200)+'. Nothing was spent or written.'); }
const want=String(p['Table']||'').trim()||'People';
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()===want.toLowerCase());
if(!t){ throw new Error('Base '+baseId+' has no '+want+' table. Scaffold the base first. Nothing was spent or written.'); }
return [{ json:{ tableId:t.id, tableName:t.name, fieldNames:(t.fields||[]).map(f=>f.name) } }];
