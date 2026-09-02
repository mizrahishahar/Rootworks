// Launch Params: the launch row (or the caller's passthrough item, same keys) is the whole
// contract. Read: Client (resolves the base), Table (by name, required, no default, and it must be
// "Companies": this machine sources people for companies and refuses any other table), View (a
// Companies view, by name, required, no default; the insert doors call with "Not Sourced"), Tiers
// (the named mode, see below), Departments (mapped into each provider's own vocabulary; blank or
// ALL means no department filter), Roles (the seniority lever, see below), Max companies (the
// spend cap, required). Tag is not read: People stores no Tag, it is a lookup through the
// Companies link (ruled 2026-09-02). Any missing piece stops the run here, before a paid call.
//
// REFUSALS (2026-09-03). A launch row that was not properly filled is an EXPECTED outcome, not a
// crash, and it must be visible on the row the Operator launched. So every guard below RETURNS a
// refusal item (`refused` carries the named reason) instead of throwing. `Launch OK?` routes that
// item to Build Refusal, which closes the launch row as Failed with the reason and the execution
// link, and the run ends there: no table read, no paid call, nothing written. Only genuinely
// unexpected errors still throw, so the Error Logger keeps catching real crashes and nothing else.
// The row is already stamped Running with the Execution ID before this node runs, so the close is
// an upsert onto that same row.
//
// TIERS (Hub Automations fldMg1W5uqWocEPSe, single select, ruled 2026-09-02). One named mode
// instead of an arbitrary source set:
//   "ContaGen -> Supersoniq -> AI-Ark"  the full waterfall
//   "AI-Ark"                            the intent path: AI-Ark only, a flat cap of five people
//                                       per company and the buyer seniorities only
//   "ContaGen -> Supersoniq"            the waterfall without AI-Ark
// Blank falls back to the older Sources multi-select so launch rows in flight keep working; blank
// on both is the full waterfall. Sources is superseded and can be deleted once nothing carries it.
//
// ROLES (Hub Automations fld0NcoXexQgV4iiw, multi select, ruled 2026-09-02). The provider-neutral
// seniority vocabulary, the same one People.Seniority carries, mapped into each provider's own
// filter vocabulary. A pick OVERRIDES that provider's in-code seniority net; blank leaves every
// provider on its default, byte for byte as before. A role with no home at a provider is dropped
// there and named in the run log, exactly as Departments already behaves. The mapping:
//
//   Roles          ContaGen (DiscoLike)  Supersoniq                  AI-Ark
//   Founder        executive             Founder                     founder
//   Owner          executive             Owner                       owner
//   Partner        executive             Partner                     partner
//   Board / Chair  executive             Board / Chair               (none)
//   C-Suite        executive             C-Suite                     c_suite
//   President      executive             President                   c_suite
//   Executive      executive             C-Suite                     c_suite
//   VP             vp                    VP                          vp
//   EVP / SVP      vp                    EVP / SVP                   vp
//   Head           director              Head                        head
//   Director       director              Director                    director
//   Manager        manager               Manager, Senior Manager     manager
//   Senior         senior_ic             Senior                      (none)
//   Unclassified   (none)                Unclassified                (none)
//
// Every provider value in the three vocabularies has a home above and nothing outside them is
// ever sent. When a pick maps to nothing at a provider that provider keeps its in-code default,
// so an override never narrows a net to empty.
let rec=null, trigger='form';
try{ rec=$('Fetch Launch Record').first().json; }catch(e){}
if(!rec||!rec.fields){ rec=$('Event Row').first().json; trigger='event'; }
const f=rec.fields||{};
// Resolve Base is allowed to answer with an error item (a launch row with no Client link is asked
// for record "recMISSING"), so read it defensively: no Clayroots Base ID means the base guard
// below refuses, it never crashes here.
const cf=(($('Resolve Base').first().json||{}).fields)||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const where='Launch record '+(rec.id||'(event)');
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
const table=((f['Table']||'')+'').trim();
const view=((f['View']||'')+'').trim();
const maxCompanies=Math.floor(Number(f['Max companies'])||0);
const tiersRaw=((f['Tiers']||'')+'').trim();
const startedAt=new Date().toISOString();
// Every refusal carries what the row actually held, so the Failed row names the reason AND shows
// the Operator the launch row as the machine read it.
const refuse=(reason)=>[{ json:{
  refused: reason,
  trigger: trigger,
  _launchRecordId: rec.id||'',
  clientRecId: clientRecId,
  base: base,
  table: table,
  view: view,
  maxCompanies: maxCompanies,
  tiers: tiersRaw,
  startedAt: startedAt
} }];
if(!clientRecId){ return refuse(where+' has no Client link. Nothing was pulled.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ return refuse('Client on '+where.toLowerCase()+' has no valid Clayroots Base ID. Nothing was pulled.'); }
if(!table){ return refuse(where+' has no Table. This machine takes Table "Companies" by name, no default. Nothing was pulled.'); }
if(table.toLowerCase()!=='companies'){ return refuse(where+' names Table "'+table+'". This machine sources people for companies and takes only Table "Companies". Nothing was pulled.'); }
if(!view){ return refuse(where+' has no View. A Companies view is required by name, no default (the insert doors pass "Not Sourced"). Nothing was pulled.'); }
if(!(maxCompanies>0)){ return refuse(where+' has no Max companies. It is the spend cap and it is required. Nothing was pulled.'); }
const ALL_SOURCES=['ContaGen','Supersoniq','AI-Ark'];
const slug=(s)=>String(s).toLowerCase().replace(/[^a-z]/g,'');
const MODES=[
  { label:'ContaGen -> Supersoniq -> AI-Ark', sources:['ContaGen','Supersoniq','AI-Ark'] },
  { label:'AI-Ark', sources:['AI-Ark'] },
  { label:'ContaGen -> Supersoniq', sources:['ContaGen','Supersoniq'] }
];
const modeKey=(s)=>String(s||'').toLowerCase().replace(/[^a-z]/g,'');
let sources=null, tiers='';
if(tiersRaw){
  const hit=MODES.find(m=>modeKey(m.label)===modeKey(tiersRaw));
  if(!hit){ return refuse(where+' names Tiers "'+tiersRaw+'", which is not one of the three modes ('+MODES.map(m=>m.label).join(', ')+'). Nothing was pulled.'); }
  sources=hit.sources.slice(); tiers=hit.label;
}
if(!sources){
  const srcRaw=arr(f['Sources']).map(s=>String(s).trim()).filter(Boolean);
  const picked=ALL_SOURCES.filter(s=>srcRaw.some(x=>slug(x)===slug(s)));
  sources=picked.length?picked:ALL_SOURCES.slice();
  const hit=MODES.find(m=>m.sources.length===sources.length&&m.sources.every(s=>sources.indexOf(s)>-1));
  tiers=(hit?hit.label:sources.join(' + '))+' (from Sources, no Tiers on the row)';
}
const arkOnly=sources.length===1&&sources[0]==='AI-Ark';
// Departments: the Hub multi-select (ALL, Executive, Engineering, Technology, Product, Data, R&D,
// Security, Design, Operations, Sales, Marketing, Finance, Human Resources, Customer Success,
// Project Management, Strategy, Legal, Supply Chain, Communications) mapped per provider.
// DiscoLike `department` accepts exactly: Operations, Executive, Technology, Sales - Marketing,
// Finance, Legal, Human Resources, Medical - Science, Customer Service, Research & Development,
// Administration, Public Relations, Investor Relations, Pro Services, Other. Anything else 422s,
// so a pick with no DiscoLike home (Design) is dropped and named in the log, never sent.
const CG_DEP={ 'executive':'Executive', 'engineering':'Technology', 'technology':'Technology', 'product':'Technology', 'data':'Technology', 'r&d':'Research & Development', 'security':'Technology', 'operations':'Operations', 'sales':'Sales - Marketing', 'marketing':'Sales - Marketing', 'finance':'Finance', 'human resources':'Human Resources', 'customer success':'Customer Service', 'project management':'Operations', 'strategy':'Executive', 'legal':'Legal', 'supply chain':'Operations', 'communications':'Public Relations' };
// AI-Ark `contact.departmentAndFunction.any.include` (key and nesting verified in their docs
// 2026-09-02). Values below are verbatim slugs from their taxonomy CSV
// (https://static.ai-ark.com/ark/departments-and-functions.csv, column department_or_function,
// read 2026-09-02): parent departments plus a few named functions. Executive and Strategy have
// no AI-Ark department (executives ride on the seniority filter) and are left unmapped there.
const ARK_DEP={ 'engineering':['engineering_technical'], 'technology':['information_technology'], 'product':['product_management'], 'data':['data_science','data_engineering','business_intelligence'], 'r&d':['research'], 'security':['cybersecurity'], 'design':['design'], 'operations':['operations'], 'sales':['sales'], 'marketing':['marketing'], 'finance':['finance'], 'human resources':['human_resources'], 'customer success':['customer_success_and_support'], 'project management':['program_and_project_management'], 'legal':['legal'], 'supply chain':['supply_chain','procurement','purchasing','transportation_and_logistics'], 'communications':['media_and_communication'] };
const depRaw=arr(f['Departments']).map(s=>String(s).trim()).filter(Boolean);
const wide=!depRaw.length||depRaw.some(d=>d.toUpperCase()==='ALL');
const cgDepartments=[], arkFunctions=[], unmapped=[];
if(!wide){
  for(const d of depRaw){
    const k=d.toLowerCase();
    const cg=CG_DEP[k]; if(cg){ if(cgDepartments.indexOf(cg)<0) cgDepartments.push(cg); } else unmapped.push(d);
    const ark=ARK_DEP[k]; if(ark){ for(const v of [].concat(ark)){ if(arkFunctions.indexOf(v)<0) arkFunctions.push(v); } }
  }
}
// Roles, mapped per provider by the table in this file's header. Values are verbatim from each
// provider's own vocabulary: DiscoLike seniority (executive, vp, director, manager, senior_ic),
// Supersoniq seniority, AI-Ark seniority (founder, owner, partner, c_suite, vp, head, director,
// manager). Nothing outside those lists is ever sent.
const CG_ROLE={ 'founder':'executive', 'owner':'executive', 'partner':'executive', 'board / chair':'executive', 'c-suite':'executive', 'president':'executive', 'executive':'executive', 'vp':'vp', 'evp / svp':'vp', 'head':'director', 'director':'director', 'manager':'manager', 'senior':'senior_ic' };
const SQ_ROLE={ 'founder':['Founder'], 'owner':['Owner'], 'partner':['Partner'], 'board / chair':['Board / Chair'], 'c-suite':['C-Suite'], 'president':['President'], 'executive':['C-Suite'], 'vp':['VP'], 'evp / svp':['EVP / SVP'], 'head':['Head'], 'director':['Director'], 'manager':['Manager','Senior Manager'], 'senior':['Senior'], 'unclassified':['Unclassified'] };
const ARK_ROLE={ 'founder':['founder'], 'owner':['owner'], 'partner':['partner'], 'c-suite':['c_suite'], 'president':['c_suite'], 'executive':['c_suite'], 'vp':['vp'], 'evp / svp':['vp'], 'head':['head'], 'director':['director'], 'manager':['manager'] };
const roleRaw=arr(f['Roles']).map(s=>String(s).trim()).filter(Boolean);
const cgSeniority=[], sqSeniority=[], arkSeniority=[];
const noCg=[], noSq=[], noArk=[];
for(const r of roleRaw){
  const k=r.toLowerCase();
  const cg=CG_ROLE[k]; if(cg){ if(cgSeniority.indexOf(cg)<0) cgSeniority.push(cg); } else noCg.push(r);
  const sq=SQ_ROLE[k]; if(sq){ for(const v of sq){ if(sqSeniority.indexOf(v)<0) sqSeniority.push(v); } } else noSq.push(r);
  const ark=ARK_ROLE[k]; if(ark){ for(const v of ark){ if(arkSeniority.indexOf(v)<0) arkSeniority.push(v); } } else noArk.push(r);
}
const rolesUnmapped=[];
if(noCg.length) rolesUnmapped.push('no ContaGen seniority for '+noCg.join(', '));
if(noSq.length) rolesUnmapped.push('no Supersoniq seniority for '+noSq.join(', '));
if(noArk.length) rolesUnmapped.push('no AI-Ark seniority for '+noArk.join(', '));
return [{ json: {
  refused: '',
  base: base,
  clientRecId: clientRecId,
  table: 'Companies',
  view: view,
  tiers: tiers,
  sources: sources,
  arkOnly: arkOnly,
  departments: depRaw,
  cgDepartments: cgDepartments,
  arkFunctions: arkFunctions,
  departmentsUnmapped: unmapped,
  roles: roleRaw,
  cgSeniority: cgSeniority,
  sqSeniority: sqSeniority,
  arkSeniority: arkSeniority,
  rolesUnmapped: rolesUnmapped,
  maxCompanies: maxCompanies,
  trigger: trigger,
  _launchRecordId: rec.id||'',
  startedAt: startedAt
} }];
