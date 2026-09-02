// Plan Contract: THE RULE, the PlusVibe door's doctrine on the Alta side. The view's visible
// columns are the contract: MACHINE fields never sent (the register's machine fields, taken from
// the field register the push inlines as REGISTER at the @@register line, every name checked
// against it so the list cannot drift), IGNORE (never-block) fields sent when filled, every
// other visible column a REQUIRED variable (extraInfoData). Identity here is LinkedIn URL +
// Company (company_clean on a legacy table); first_name rides along, never blocks; Final Email
// rides along when present, never blocks. Any view the launch row names deploys (ruling 2026-09-02).
// @@register
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{ok:false, crBase:D.crBase||'appMISSING', mirrorTableId:'tblMISSING', target:D.target||''}}]; }
let vm={};
try{ vm=($input.first()||{}).json||{}; }catch(e){}
const visibleIds=Array.isArray(vm.visibleFieldIds)?vm.visibleFieldIds:null;
if(!visibleIds){ D.warnings.push('view metadata unavailable ('+String(vm.error?JSON.stringify(vm.error).slice(0,120):'no visibleFieldIds')+'); only identity is enforced and no variables are sent'); }
// The machine fields, by group as the register declares them (ruling 2026-09-02): the email lane,
// the campaign fields the deploy doors and the leads sync write, the formulas, the contact
// provenance, the contact-pull stamps. Each name must exist on the register, or the push is wrong.
const MACHINE_GROUPS={
  lane:['MV P0','P1 (Trykitt)','MV P1','P2 (LeadMagic)','MV P2','P3 (Prospeo)','MV P3','BB','Final Email','Email Source','Status'],
  campaign:['Campaigns','Messages Sent','Last Contacted','Campaign Status','Bounce Reason','Synced At','Deploy Error'],
  formulas:['manually_approved','relevance','linkedin_name_match','Build Date'],
  provenance:['Contact Key','Contact Source','Source ID'],
  pull:['Contacts Pulled At','Contacts Count','Contact Sources']
};
const regNames=new Set(); for(const T of (REGISTER.tables||[])) for(const f of (T.fields||[])) regNames.add(f.name);
const MACHINE=new Set();
for(const g of Object.keys(MACHINE_GROUPS)) for(const n of MACHINE_GROUPS[g]){ if(!regNames.has(n)) throw new Error('Plan Contract: the field register has no machine field "'+n+'" ('+g+'); fix the register or this list'); MACHINE.add(n); }
const IGNORE=new Set(['last_name','Title','Social','Phone','MX Provider','MX provider','MX','LinkedIn URL','City','State','State Full','Country','Zip','Street','Seniority','Department','Existing In Role','ICP Reason','Description','Industry Groups','Employees','Revenue Range','Score','Keywords','Company Status','Start Date','Company City','Company State','Phones','Public Emails','Social URLs','Redirect Domain','Email Pattern','Signal Detail','detected_at']);
const IDENTITY=new Set(['first_name','Company','company_clean']);
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
