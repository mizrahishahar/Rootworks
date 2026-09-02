// Resolve Table: the launch names the table (People or Companies, blank = People); its id comes
// from the base meta Check Table just read, never from the Hub (ClayRoots Standard, law 3).
// The record door still honours a legacy body.tableId for one release (Waterfall Contacts'
// hand-off); body.table wins whenever both arrive. Nothing here creates a table or a field.
const p=$('Params').first().json;
const baseId=p['Clayroots Base ID'];
const resp=$('Check Table').first().json||{};
const tables=Array.isArray(resp.tables)?resp.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+baseId+': '+JSON.stringify(resp).slice(0,200)+'. Nothing was spent or written.'); }
const byName=(n)=>tables.find(x=>String(x.name||'').trim().toLowerCase()===String(n).trim().toLowerCase());
const want=String(p['Table']||'').trim();
const legacyId=String(p.tableId||'').trim();
let t=null, legacy=false;
if(want){
  t=byName(want);
  if(!t){ throw new Error('Base '+baseId+' has no '+want+' table. Scaffold the base first. Nothing was spent or written.'); }
} else if(legacyId){
  t=tables.find(x=>x.id===legacyId); legacy=true;
  if(!t){ throw new Error('Table '+legacyId+' (legacy tableId) is not in base '+baseId+'. Pass table (People or Companies) instead. Nothing was spent or written.'); }
} else {
  t=byName('People');
  if(!t){ throw new Error('Base '+baseId+' has no People table. Scaffold the base first. Nothing was spent or written.'); }
}
return [{ json:{ tableId:t.id, tableName:t.name, fieldNames:(t.fields||[]).map(f=>f.name), legacyTableId:legacy } }];
