// Verify Extras: re-read the schema after the creates and refuse loudly if any declared
// extra is still missing. Emits the write contract: the table id, its name, the exact
// field-name list the upsert may write (Build Companies drops every other key), and the
// mirror / DNC ids resolved upstream. Reused from Handle Hiring Intent Signal.
const base=$('Client Vars').first().json.base;
const cfg=$('Find Companies Table').first().json;
const want=$('Ensure Extras').first().json||{};
const r=$input.first().json||{};
const body=(r.body!==undefined)?r.body:r;
const tables=(body&&Array.isArray(body.tables))?body.tables:null;
if(!tables){ throw new Error('Could not re-read the table list for base '+base+' after creating fields: '+JSON.stringify(body).slice(0,200)+'. Nothing was spent or written.'); }
const t=tables.find(x=>x.id===cfg.tableId);
if(!t){ throw new Error('Companies table '+cfg.tableId+' is no longer present in base '+base+'. Nothing was spent or written.'); }
const names=new Set((t.fields||[]).map(x=>x.name));
const still=(want.wanted||[]).filter(n=>!names.has(n));
if(still.length){
  let why='';
  try{ why=$('AT Create Extra Field').all().map(i=>{ const j=i.json||{}; const b=(j.body!==undefined)?j.body:j; return (b&&b.error)?String(b.error.message||JSON.stringify(b.error)):''; }).filter(Boolean).slice(0,3).join('; '); }catch(e){}
  throw new Error('Could not create these Reviews signal extras on Companies ('+cfg.tableId+'): '+still.join(', ')+(why?' ('+why+')':'')+'. Nothing was spent or written.');
}
return [{ json: Object.assign({}, cfg, { fieldNames: Array.from(names), extrasCreated: want.missingNames||[] }) }];
