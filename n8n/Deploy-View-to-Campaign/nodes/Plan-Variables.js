const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{needDe:false, view:D.view, crBase:D.crBase, tableId:D.tableId, dncTableId:''}}]; }
const tables=D.schemaTables||[];
const t=tables.find(x=>x.id===D.tableId);
if(!t){ D.abort='table not found'; D.errors.push('table '+D.tableId+' not resolved in schema'); return [{json:{needDe:false, view:D.view, crBase:D.crBase, tableId:D.tableId, dncTableId:''}}]; }
const dncT=tables.find(x=>String(x.name).toLowerCase()==='dnc');
D.dncTableId=dncT?dncT.id:'';
// The campaigns mirror table, found by the same signature the PV->CR sync uses:
// has Campaign ID and Sequencer, does not have Final Email.
const mirT=tables.find(x=>{ const ns=new Set((x.fields||[]).map(f=>f.name)); return !ns.has('Final Email')&&ns.has('Campaign ID')&&ns.has('Sequencer'); });
D.mirrorTableId=mirT?mirT.id:'';
if(!D.mirrorTableId) D.warnings.push('no campaigns mirror table in base (Campaign ID + Sequencer, no Final Email); Campaigns links not stamped');
const vm=D.viewMeta||{};
const visible=Array.isArray(vm.visibleFieldIds)?vm.visibleFieldIds:null;
// THE RULE: anything VISIBLE in the view must be filled, or the row is skipped.
// IGNORE never blocks. IDENTITY is checked separately as a hard requirement,
// except the first name: it blocks only when the view actually shows first_name
// or first_name_he, so company-inbox lists deploy without a person name.
// CORE_LEAD is sent to PlusVibe as a standard lead field, and is required when visible.
const IGNORE=new Set(['last_name','Title','Social','Phone','MX Provider','MX provider','MX','Seniority','Department','Existing In Role','ICP Reason','Description','Industry Groups','Employees','Revenue Range','Keywords','Company Status','Company City','Company State','Phones','Public Emails','Social URLs','Email Pattern','Signal Detail','detected_at','LinkedIn URL']);
const IDENTITY=new Set(['Final Email','first_name','first_name_he','company_clean','Company']);
const CORE_LEAD=new Set(['State','State Full','City','Country']);
const MACHINE=new Set(['Status','MV','MV P0','MV P1','MV P2','MV P3','BB','P1','P2','P3','P1 (Trykitt)','P2 (LeadMagic)','P3 (Prospeo)','Source','Contact Source','Run ID','Build Date','Contact Key','Created','Seniority Rank','segment','query_name','ingested_at','RankInCompany','Co Rank','Campaign Segment','reloaded_patch','manually_approved','relevance','public_emails_clean','Email','Domain','Campaigns','Campaigns (old text)','Messages Sent','Last Contacted','Campaign Status','Bounce Reason','Synced At','Deploy Error','Name','Valid','Intent Status','LinkedIn Campaign','Email Campaign','LinkedIn Routed At','Email Routed At','Target Campaign','routed_at','Enroll Confirmed','Enroll Error','Event Type','First Hire','linkedin_name_match','Tag']);
const snake=k=>String(k).replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').toLowerCase();
const fields=t.fields||[];
let hasDe=false;
for(const f of fields){ if(f.name==='Deploy Error') hasDe=true; }
const varCols=[]; const rideCols=[]; const requiredCore=[]; let needFirstName=true;
const consider=(name)=>{
  if(MACHINE.has(name)||IDENTITY.has(name)) return;
  if(IGNORE.has(name)||/^job\s/i.test(String(name))){ rideCols.push({name:name, key:snake(name)}); return; }
  if(CORE_LEAD.has(name)){ requiredCore.push(name); return; }
  varCols.push({name:name, key:snake(name)});
};
if(visible){
  const byId={};
  for(const f of fields) byId[f.id]=f;
  needFirstName=false;
  for(const fid of visible){ const f=byId[fid]; if(!f) continue; if(f.name==='first_name'||f.name==='first_name_he') needFirstName=true; consider(f.name); }
} else {
  let why='view metadata unavailable';
  if(!D.viewId) why='view "'+D.view+'" not found in table views list';
  else if(D.viewType&&D.viewType!=='grid') why='view "'+D.view+'" is type '+D.viewType+', not grid';
  else if(vm&&vm.error) why='view metadata call failed: '+JSON.stringify(vm.error).slice(0,150);
  D.warnings.push(why+'; visibility unknown, so only identity fields are enforced and no custom variables are sent');
}
D.plan={varCols, rideCols};
D.requiredCore=requiredCore;
D.needFirstName=needFirstName;
if(!needFirstName) D.warnings.push('view "'+D.view+'" does not show first_name; the first name is not enforced and leads deploy without one');
D.schemaTables=null; D.viewMeta=null;
return [{json:{needDe:!hasDe, view:D.view, crBase:D.crBase, tableId:D.tableId, dncTableId:D.dncTableId, mirrorTableId:D.mirrorTableId}}];