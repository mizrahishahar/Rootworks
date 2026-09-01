// Find Companies Table: the client base must already carry a table named exactly
// "Companies" with a Domain primary field. Nothing here ever creates a table; the
// scaffold is Onboard Client's job (List Building 2.0).
const p=$('Launch Params').first().json;
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+p.base+': '+JSON.stringify(body).slice(0,200)+'. Nothing was pulled.'); }
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()==='companies');
if(!t){ throw new Error('Base '+p.base+' has no Companies table. Scaffold the client base to the List Building 2.0 standard first. Nothing was pulled.'); }
const names=new Set((t.fields||[]).map(x=>x.name));
for(const need of ['Domain','Company','Domain Source','Tag']){ if(!names.has(need)){ throw new Error('Companies table '+t.id+' is missing the core field "'+need+'". Bring it to the register first. Nothing was pulled.'); } }
const dnc=tables.find(x=>String(x.name||'').trim().toLowerCase()==='dnc');
return [{ json: Object.assign({}, p, { tableId: t.id, tableName: t.name, fieldNames: Array.from(names), dncTableId: dnc?dnc.id:'' }) }];
