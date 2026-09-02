// Resolve Table: the launch names the table (People or Companies, blank = People); its id comes
// from the base meta Fetch Table Schema just read, never from the Hub (ClayRoots Standard, law 3).
// Nothing here creates a table or a field.
const v=$('Validate & Build Lookup').first().json;
const resp=$input.first().json||{};
const tables=Array.isArray(resp.tables)?resp.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+v.baseId+': '+JSON.stringify(resp).slice(0,200)+'. Nothing was written.'); }
const want=String(v.table||'People').trim();
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()===want.toLowerCase());
if(!t){ throw new Error('Base '+v.baseId+' has no '+want+' table. Scaffold the base first. Nothing was spent or written.'); }
return [{ json: Object.assign({}, v, { tableId:t.id, tableName:t.name }) }];
