// Plan Lookup: the count lives on Companies; People shows it through a lookup of the same name, so
// People views can filter on it. Runs on both paths (column just created, or already there) off
// the freshest base meta: Reread Meta when a create ran, Check Table otherwise. One lookup planned
// when People exists, links to Companies, and lacks a column of that name. A People column of that
// name at another type is left alone and named in the log; a base without People is fine (nothing
// to mirror). Never refuses: the count on Companies is the job, the mirror is a courtesy.
const p=$('Params').first().json;
const t=$('Resolve Table').first().json;
let body=null;
try{ const r=$('Reread Meta').first().json||{}; body=(r.body!==undefined)?r.body:r; }catch(e){}
if(!body||!Array.isArray(body.tables)){ try{ const r=$('Check Table').first().json||{}; body=(r.body!==undefined)?r.body:r; }catch(e){} }
const tables=(body&&Array.isArray(body.tables))?body.tables:[];
const companies=tables.find(x=>x.id===t.tableId)||{};
const own=(companies.fields||[]).find(f=>f.name===p.outputField);
const people=tables.find(x=>String(x.name||'').trim().toLowerCase()==='people');
const out={ _none:true, note:'', create:null };
if(!own){ out.note='the count column was not found on Companies after the check; no lookup planned'; return [{ json:out }]; }
if(!people){ out.note='the base has no People table; nothing to mirror'; return [{ json:out }]; }
const link=(people.fields||[]).find(f=>f.type==='multipleRecordLinks'&&f.options&&f.options.linkedTableId===t.tableId);
if(!link){ out.note='People has no link to Companies; nothing to mirror'; return [{ json:out }]; }
const held=(people.fields||[]).find(f=>f.name===p.outputField);
if(held){ out.note=(held.type==='multipleLookupValues')?'':('People already holds "'+p.outputField+'" as '+held.type+'; the lookup was not created'); return [{ json:out }]; }
out._none=false;
out.create={ url:'https://api.airtable.com/v0/meta/bases/'+p.base+'/tables/'+people.id+'/fields', body:{ name:p.outputField, type:'multipleLookupValues', options:{ recordLinkFieldId:link.id, fieldIdInLinkedTable:own.id } } };
return [{ json:out }];
