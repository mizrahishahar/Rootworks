// Plan Variables: THE RULE. The view's visible columns are the merge contract: every visible
// column is a custom variable and a row with an empty one is skipped. Three exceptions, in order:
// MACHINE columns are never read and never sent (the register's machine fields: the email lane,
// the Campaigns link and the sync's fields, the relevance and identity formulas, the contact
// provenance, the contact-pull stamps; taken from the field register the push inlines as
// REGISTER at the @@register line, every name checked against it so the list cannot drift);
// IDENTITY columns become the lead itself (email, first name, company), never a variable;
// IGNORE columns ride along when filled and never block. CORE_LEAD columns are standard lead
// fields, required when visible. A column on the table that is not on the register is the
// Operator's and deploys as a variable like any other visible column.
// @@register
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const shape=(extra)=>Object.assign({view:D.viewId||D.view, crBase:D.crBase, tableId:D.tableId, dncTableId:D.dncTableId||'', mirrorTableId:D.mirrorTableId||'', fieldNames:[]}, extra||{});
if(D.abort){ return [{json:shape()}]; }
const tables=D.schemaTables||[];
const t=tables.find(x=>x.id===D.tableId);
if(!t){ D.abort='table not found'; D.errors.push('table '+D.tableId+' not resolved in schema'); return [{json:shape()}]; }
const dncT=tables.find(x=>String(x.name).toLowerCase()==='dnc');
D.dncTableId=dncT?dncT.id:'';
// The campaigns mirror table, found by the same signature the PV->CR sync uses:
// has Campaign ID and Sequencer, does not have Final Email.
const mirT=tables.find(x=>{ const ns=new Set((x.fields||[]).map(f=>f.name)); return !ns.has('Final Email')&&ns.has('Campaign ID')&&ns.has('Sequencer'); });
D.mirrorTableId=mirT?mirT.id:'';
if(!D.mirrorTableId) D.warnings.push('no campaigns mirror table in base (Campaign ID + Sequencer, no Final Email); Campaigns links not stamped');
const fields=t.fields||[];
const have=new Set(fields.map(f=>f.name));
// The lead's LinkedIn URL column: `LinkedIn URL` on a register-shaped table; `Social` only on a
// legacy table that has no `LinkedIn URL`. Never both, never guessed.
D.linkedinCol=have.has('LinkedIn URL')?'LinkedIn URL':(have.has('Social')?'Social':'');
// The columns this door writes (Deploy Error, Campaigns) are Check Columns' business, next:
// nothing is ever created on a client table by this door (Operator ruling 2026-09-02).
const vm=D.viewMeta||{};
const visible=Array.isArray(vm.visibleFieldIds)?vm.visibleFieldIds:null;
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
for(const g of Object.keys(MACHINE_GROUPS)) for(const n of MACHINE_GROUPS[g]){ if(!regNames.has(n)) throw new Error('Plan Variables: the field register has no machine field "'+n+'" ('+g+'); fix the register or this list'); MACHINE.add(n); }
const IGNORE=new Set(['last_name','Title','Social','Phone','MX Provider','MX provider','MX','Seniority','Department','Existing In Role','ICP Reason','Description','Industry Groups','Employees','Revenue Range','Keywords','Company Status','Company City','Company State','Phones','Public Emails','Social URLs','Email Pattern','Signal Detail','detected_at','LinkedIn URL']);
const IDENTITY=new Set(['Final Email','first_name','first_name_he','company_clean','Company']);
const CORE_LEAD=new Set(['State','City','Country']);
const snake=k=>String(k).replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_+|_+$/g,'').toLowerCase();
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
  if(D.viewType&&D.viewType!=='grid') why='view "'+D.view+'" is type '+D.viewType+', not grid';
  else if(vm&&vm.error) why='view metadata call failed: '+JSON.stringify(vm.error).slice(0,150);
  D.warnings.push(why+'; visibility unknown, so only identity fields are enforced and no custom variables are sent');
}
D.plan={varCols, rideCols};
D.requiredCore=requiredCore;
D.needFirstName=needFirstName;
if(!needFirstName) D.warnings.push('view "'+D.view+'" does not show first_name; the first name is not enforced and leads deploy without one');
D.schemaTables=null; D.viewMeta=null;
return [{json:shape({fieldNames:Array.from(have)})}];
