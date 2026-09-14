// Resolve Table: Companies by name in the base meta just read, the view by name or id. A base
// without Companies or without the view is refused on the row (Table OK? routes to Build Refusal).
// Field names and types travel for the column check. Nothing here creates.
const p=$('Params').first().json;
const r=$input.first().json||{}; const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
const refuse=(why)=>[{ json:{ refused:why } }];
if(!tables) return refuse('Could not read the table list for base '+p.base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was asked.');
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()==='companies');
if(!t) return refuse('Base '+p.base+' has no Companies table. Nothing was asked.');
const v=(t.views||[]).find(x=>x.id===p.view||String(x.name||'').trim()===p.view);
if(!v) return refuse('Companies ('+t.id+') in base '+p.base+' has no view "'+p.view+'". Nothing was asked.');
const types={}; for(const f of (t.fields||[])) types[f.name]=f.type;
return [{ json:{ refused:'', tableId:t.id, tableName:t.name, viewId:v.id, viewName:v.name, fieldNames:(t.fields||[]).map(f=>f.name), fieldTypes:types } }];
