// Resolve Table: the launch names the table and the view, both by name, both required, no
// defaults (Operator ruling 2026-09-02); the ids come from the base meta Check Table just read,
// never from the Hub (ClayRoots Standard, law 3). The record door (Waterfall Contacts' hand-off)
// names them the same way: body.table and body.view; the legacy body.tableId is no longer read.
// Waterfall Emails runs on People only: a Companies launch is refused here, before any paid call
// (company inboxes are Verify Emails' job, the short lane). Nothing here creates a table or a field.
const p=$('Params').first().json;
const baseId=p['Clayroots Base ID'];
const resp=$('Check Table').first().json||{};
const tables=Array.isArray(resp.tables)?resp.tables:null;
if(!tables){ throw new Error('Could not read the table list for base '+baseId+': '+JSON.stringify(resp).slice(0,200)+'. Nothing was spent or written.'); }
const want=String(p['Table']||'').trim();
const view=String(p['View']||'').trim();
if(!want){ throw new Error('The launch names no Table (People or Companies). Fill it and relaunch. Nothing was spent or written.'); }
if(!view){ throw new Error('The launch names no View. Fill it and relaunch. Nothing was spent or written.'); }
if(want.toLowerCase()==='companies'){ throw new Error('Waterfall Emails runs on People. For company inboxes use Verify Emails. Nothing was spent.'); }
const t=tables.find(x=>String(x.name||'').trim().toLowerCase()===want.toLowerCase());
if(!t){ throw new Error('Base '+baseId+' has no '+want+' table. Scaffold the base first. Nothing was spent or written.'); }
if(String(t.name).toLowerCase()==='companies'){ throw new Error('Waterfall Emails runs on People. For company inboxes use Verify Emails. Nothing was spent.'); }
const v=(t.views||[]).find(x=>x.id===view||String(x.name||'').trim()===view);
if(!v){ throw new Error('Table "'+t.name+'" in base '+baseId+' has no view "'+view+'". Nothing was spent or written.'); }
return [{ json:{ tableId:t.id, tableName:t.name, viewId:v.id, viewName:v.name, fieldNames:(t.fields||[]).map(f=>f.name) } }];
