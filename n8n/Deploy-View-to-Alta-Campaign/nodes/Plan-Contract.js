// Plan Contract: THE RULE, the PlusVibe door's doctrine on the Alta side. The view's visible
// columns are the contract: machine fields never sent, convention (never-block) fields sent
// when filled, every other visible column a REQUIRED variable (extraInfoData). Identity here
// is LinkedIn URL + first_name + Company; Final Email rides along when present, never blocks.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{ok:false, crBase:D.crBase||'appMISSING', mirrorTableId:'tblMISSING', target:D.target||''}}]; }
let vm={};
try{ vm=($input.first()||{}).json||{}; }catch(e){}
const visibleIds=Array.isArray(vm.visibleFieldIds)?vm.visibleFieldIds:null;
if(!visibleIds){ D.warnings.push('view metadata unavailable ('+String(vm.error?JSON.stringify(vm.error).slice(0,120):'no visibleFieldIds')+'); only identity is enforced and no variables are sent'); }
const MACHINE=new Set(['Status','MV','MV P0','MV P1','MV P2','MV P3','BB','P1','P2','P3','P1 (Trykitt)','P2 (LeadMagic)','P3 (Prospeo)','Source','Email Source','Contact Source','Contact Key','Run ID','Build Date','Created','Seniority Rank','segment','query_name','ingested_at','RankInCompany','Co Rank','Campaign Segment','reloaded_patch','manually_approved','relevance','public_emails_clean','Email','Domain','Campaigns','Campaigns (old text)','Messages Sent','Last Contacted','Campaign Status','Bounce Reason','Synced At','Deploy Error','Name','Valid','Intent Status','LinkedIn Campaign','Email Campaign','LinkedIn Routed At','Email Routed At','Target Campaign','routed_at','Enroll Confirmed','Enroll Error','Event Type','Final Email','company_clean','First Hire','linkedin_name_match','Tag']);
const IGNORE=new Set(['last_name','Title','Social','Phone','MX Provider','MX provider','MX','LinkedIn URL','City','State','State Full','Country','Zip','Street','Seniority','Department','Existing In Role','ICP Reason','Description','Industry Groups','Employees','Revenue Range','Score','Keywords','Company Status','Start Date','Company City','Company State','Phones','Public Emails','Social URLs','Redirect Domain','Email Pattern','Signal Detail','detected_at']);
const IDENTITY=new Set(['first_name','Company']);
const neverBlock=(col)=>IGNORE.has(col)||/^job\s/i.test(String(col));
const varCols=[]; const rideCols=[];
if(visibleIds){
  for(const fid of visibleIds){
    const name=D.fieldsById[fid]; if(!name) continue;
    if(MACHINE.has(name)||IDENTITY.has(name)) continue;
    if(neverBlock(name)){ if(name!=='LinkedIn URL'&&name!=='last_name') rideCols.push(name); continue; }
    varCols.push(name);
  }
}
D.plan={varCols, rideCols};
D.fieldsById=null;
return [{json:{ok:true, crBase:D.crBase, tableId:D.tableId, viewName:D.view, mirrorTableId:D.mirrorTableId||'tblMISSING', target:D.target}}];
