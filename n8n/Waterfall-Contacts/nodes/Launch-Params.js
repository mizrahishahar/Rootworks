// Launch Params: the launch row (or the caller's passthrough item, same keys) is the whole
// contract. Read: Client (resolves the base), View (a Companies view, default Uncovered),
// Tag (fallback for People rows whose company carries none), Sources (ContaGen, Supersoniq,
// AI-Ark; blank means all three), Departments (mapped into each provider's own vocabulary;
// blank or ALL means no department filter), Max companies (the spend cap, required).
// Seniority is fixed in code per tier (ruled 2026-09-02); the row's Seniority field is not read.
// Any missing piece stops the run here, before a single paid call.
let rec=null, trigger='form';
try{ rec=$('Fetch Launch Record').first().json; }catch(e){}
if(!rec||!rec.fields){ rec=$('Event Row').first().json; trigger='event'; }
const f=rec.fields||{};
const cf=($('Resolve Base').first().json.fields)||{};
const base=((cf['Clayroots Base ID']||'')+'').trim();
const arr=(v)=>Array.isArray(v)?v:(v==null||v===''?[]:[v]);
const clientRecId=(arr(f['Client']).map(x=>(x&&typeof x==='object')?x.id:x)[0])||'';
if(!clientRecId){ throw new Error('Launch record '+(rec.id||'(event)')+' has no Client link. Nothing was pulled.'); }
if(!/^app[A-Za-z0-9]{14}$/.test(base)){ throw new Error('Client on launch record '+(rec.id||'(event)')+' has no valid Clayroots Base ID. Nothing was pulled.'); }
const maxCompanies=Math.floor(Number(f['Max companies'])||0);
if(!(maxCompanies>0)){ throw new Error('Launch record '+(rec.id||'(event)')+' has no Max companies. It is the spend cap and it is required. Nothing was pulled.'); }
const view=((f['View']||'')+'').trim()||'Uncovered';
const ALL_SOURCES=['ContaGen','Supersoniq','AI-Ark'];
const slug=(s)=>String(s).toLowerCase().replace(/[^a-z]/g,'');
const srcRaw=arr(f['Sources']).map(s=>String(s).trim()).filter(Boolean);
const sources=ALL_SOURCES.filter(s=>srcRaw.some(x=>slug(x)===slug(s)));
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
return [{ json: {
  base: base,
  clientRecId: clientRecId,
  view: view,
  tag: ((f['Tag']||'')+'').trim(),
  sources: sources.length?sources:ALL_SOURCES.slice(),
  departments: depRaw,
  cgDepartments: cgDepartments,
  arkFunctions: arkFunctions,
  departmentsUnmapped: unmapped,
  maxCompanies: maxCompanies,
  trigger: trigger,
  _launchRecordId: rec.id||'',
  startedAt: new Date().toISOString()
} }];
