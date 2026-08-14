const sd=$getWorkflowStaticData('global'); const D=sd.deploy;
if(D.abort){ return [{json:{needDe:false, view:D.view, crBase:D.crBase, tableId:D.tableId, dncTableId:''}}]; }
const tables=D.schemaTables||[];
const t=tables.find(x=>x.id===D.tableId);
if(!t){ D.abort='table not found'; D.errors.push('table '+D.tableId+' not resolved in schema'); return [{json:{needDe:false, view:D.view, crBase:D.crBase, tableId:D.tableId, dncTableId:''}}]; }
const dncT=tables.find(x=>String(x.name).toLowerCase()==='dnc');
D.dncTableId=dncT?dncT.id:'';
const vm=D.viewMeta||{};
const visible=Array.isArray(vm.visibleFieldIds)?vm.visibleFieldIds:null;
// THE RULE: anything VISIBLE in the view must be filled, or the row is skipped.
// IGNORE never blocks. IDENTITY is checked separately as a hard requirement.
// CORE_LEAD is sent to PlusVibe as a standard lead field, and is required when visible.
const IGNORE=new Set(['last_name','Title','Social','Phone']);
const IDENTITY=new Set(['Final Email','first_name','first_name_he','company_clean','Company']);
const CORE_LEAD=new Set(['State','State Full','City','Country']);
const MACHINE=new Set(['Status','MV','MV P0','MV P1','MV P2','MV P3','BB','P1','P2','P3','P1 (Trykitt)','P2 (LeadMagic)','P3 (Prospeo)','Source','Contact Source','Run ID','Build Date','Contact Key','Created','Seniority Rank','segment','query_name','ingested_at','RankInCompany','Co Rank','Campaign Segment','reloaded_patch','manually_approved','public_emails_clean','Email','Domain','Campaigns','Messages Sent','Last Contacted','Campaign Status','Bounce Reason','Synced At','Deploy Error','Name','Valid']);
const snake=k=>String(k).replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').toLowerCase();
const fields=t.fields||[];
let hasDe=false;
for(const f of fields){ if(f.name==='Deploy Error') hasDe=true; }
const varCols=[]; const requiredCore=[];
const consider=(name)=>{
  if(MACHINE.has(name)||IGNORE.has(name)||IDENTITY.has(name)) return;
  if(CORE_LEAD.has(name)){ requiredCore.push(name); return; }
  varCols.push({name:name, key:snake(name)});
};
if(visible){
  const byId={};
  for(const f of fields) byId[f.id]=f;
  for(const fid of visible){ const f=byId[fid]; if(f) consider(f.name); }
} else {
  let why='view metadata unavailable';
  if(!D.viewId) why='view "'+D.view+'" not found in table views list';
  else if(D.viewType&&D.viewType!=='grid') why='view "'+D.view+'" is type '+D.viewType+', not grid';
  else if(vm&&vm.error) why='view metadata call failed: '+JSON.stringify(vm.error).slice(0,150);
  D.warnings.push(why+'; visibility unknown, so only identity fields are enforced and no custom variables are sent');
}
D.plan={varCols};
D.requiredCore=requiredCore;
D.schemaTables=null; D.viewMeta=null;
return [{json:{needDe:!hasDe, view:D.view, crBase:D.crBase, tableId:D.tableId, dncTableId:D.dncTableId}}];