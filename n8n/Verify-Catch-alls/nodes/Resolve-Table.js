// Resolve Table: People by name in the base meta; the view by name or id when one was given, else
// the table's first view (the whole table). Field names and types travel for the requirements check.
const p=$('Params').first().json;
const r=$input.first().json||{}; const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables) throw new Error('Could not read the table list for base '+p.base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was verified.');
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()==='people');
if(!t) throw new Error('Base '+p.base+' has no People table. Nothing was verified.');
let v=null;
if(p.view){ v=(t.views||[]).find(x=>x.id===p.view||String(x.name||'').trim()===p.view); if(!v) throw new Error('People ('+t.id+') in base '+p.base+' has no view "'+p.view+'". Nothing was verified.'); }
else v=(t.views||[])[0]||null;
if(!v) throw new Error('People ('+t.id+') in base '+p.base+' has no views at all.');
const types={}; for(const f of (t.fields||[])) types[f.name]=f.type;
return [{ json:{ tableId:t.id, tableName:t.name, viewId:v.id, viewName:p.view?v.name:'(whole table)', fieldNames:(t.fields||[]).map(f=>f.name), fieldTypes:types } }];
