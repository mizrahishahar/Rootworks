// Find Companies Table: the client base must already carry a table named exactly
// "Companies". Nothing here ever creates a table; the scaffold is Onboard Client's job
// (List Building 2.0). The columns are Check Columns' business, next.
const p=$('Launch Params').first().json;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+p.base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was pulled.'); }
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()==='companies');
if(!t){ throw new Error('Base '+p.base+' has no Companies table. Scaffold the base (Scaffold Client Base) first. Nothing was spent or written.'); }
const names=(t.fields||[]).map(x=>x.name);
return [{ json: Object.assign({}, p, { tableId: t.id, tableName: t.name, fieldNames: names, fieldTypes: (t.fields||[]).map(x=>({ name:x.name, type:x.type })) }) }];
