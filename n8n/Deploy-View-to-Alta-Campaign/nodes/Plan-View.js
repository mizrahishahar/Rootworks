// Plan View: the base schema into the run's plan. Resolves the table, the view by exact name,
// the campaigns mirror table (Campaign ID + Sequencer, no Final Email; same signature the
// PV->CR sync uses), the DNC table (by name, the PlusVibe door's rule), and the client share link
// from the table description (the receipt's List URL; its absence is a warning here, never sent
// to clients silently).
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
// Every return carries crBase and dncTableId: Read DNC reads them off this node's output.
const shape=(extra)=>Object.assign({viewUrl:'', rowsUrl:'', crBase:D.crBase||'', dncTableId:D.dncTableId||''}, extra||{});
if(D.abort){ return [{json:shape()}]; }
let tables=[];
try{ const j=($input.first()||{}).json||{}; tables=Array.isArray(j.tables)?j.tables:[]; }catch(e){}
const t=tables.find(x=>x.id===D.tableId);
if(!t){ D.abort='table not found'; D.errors.push('table '+D.tableId+' not in base '+D.crBase); return [{json:shape()}]; }
// The DNC table, by name, exactly as the PlusVibe door resolves it. Absent = no deploy-time
// DNC filtering for this base, and Build Prospects says so in the run log.
const dncT=tables.find(x=>String(x.name).toLowerCase()==='dnc');
D.dncTableId=dncT?dncT.id:'';
if(!D.dncTableId) D.warnings.push('no DNC table in base; DNC domains were not filtered at deploy time');
D.tableName=t.name||D.tableId;
const m=String(t.description||'').match(/https:\/\/airtable\.com\/[^\s")]+\/shr[A-Za-z0-9]+/);
D.shareViewLink=m?m[0]:'';
if(!D.shareViewLink) D.warnings.push('table description carries no share link; receipt written without a client link');
// The launch's View accepts a view id (viw...) or an exact name; ids are rename-proof and
// Campaigns.Live View ID holds ids (Operator rulings 2026-08-31 and 2026-09-02).
const v=(t.views||[]).find(x=>x.id===D.view||String(x.name)===D.view);
if(!v){ D.abort='view not found'; D.errors.push('view "'+D.view+'" not on table "'+D.tableName+'"'); return [{json:shape()}]; }
D.viewId=v.id;
const mirT=tables.find(x=>{ const ns=new Set((x.fields||[]).map(f=>f.name)); return !ns.has('Final Email')&&ns.has('Campaign ID')&&ns.has('Sequencer'); });
D.mirrorTableId=mirT?mirT.id:'';
if(!D.mirrorTableId) D.warnings.push('no campaigns mirror table in base; Campaigns links cannot be stamped');
D.fieldsById={}; const names=new Set(); for(const f of (t.fields||[])){ D.fieldsById[f.id]=f.name; names.add(f.name); }
D.hasDeployError=names.has('Deploy Error');
if(!D.hasDeployError) D.warnings.push('table has no Deploy Error field; skip reasons are not written to rows');
return [{json:shape({viewUrl:'https://api.airtable.com/v0/meta/bases/'+D.crBase+'/views/'+D.viewId+'?include=visibleFieldIds', rowsUrl:'https://api.airtable.com/v0/'+D.crBase+'/'+D.tableId+'?view='+D.viewId+'&pageSize=100'})}];
