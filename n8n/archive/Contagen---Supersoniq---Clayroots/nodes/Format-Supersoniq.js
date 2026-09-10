const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};
const crows=$('Read CSV').all().map(i=>i.json);
// Company/domain-level carry-through. Take EVERY CSV column that is not person-level or plumbing,
// mirroring the auto-adder in Build Table Schema, so a new ContaGen column reaches Supersoniq rows
// without anyone editing a hardcoded list here.
const CMAP_SKIP=new Set(['Name','Domain','domain','company_domain','Email','Verified','first_name','last_name','company_clean','State Full','segment','query_name','ingested_at','Run ID','RankInCompany','Build Date','Contact Source','Title','Seniority','Department','Social','Phone','Connections','Similarity','Tag']);
const cmap={};
for(const r of crows){const d=String(r.Domain||r.domain||r.company_domain||'').trim().toLowerCase();if(!d)continue;const c=cmap[d]||(cmap[d]={});for(const k of Object.keys(r)){if(CMAP_SKIP.has(k))continue;const v=r[k];if((c[k]===undefined||c[k]==='')&&v!==undefined&&v!==null&&String(v).trim()!=='')c[k]=String(v).trim();}}
const cgKeys=new Set($('Format ContaGen').all().map(i=>i.json['Contact Key']));
const runId=String($execution.id);
const tag=((($('Waterfall Upload').first().json['Tag'])||'')+'').trim();
const _st=($('Config').first().json||{}).startedAt;
let buildDate='';
try{ buildDate=DateTime.fromISO(String(_st)).toFormat('yyyy-MM-dd'); }catch(e){ buildDate=''; }
if(!buildDate||buildDate==='Invalid DateTime'){ buildDate=$now.toFormat('yyyy-MM-dd'); }
let skipped=0;
const responses=$input.all().map(i=>i.json);
const out=[];
for(const resp of responses){const results=(resp&&resp.results)||[];for(const co0 of results){const contacts=(co0&&co0.contacts)||[];for(const ct of contacts){const domain=String(ct.company_domain||'').trim().toLowerCase();const full=((ct.first_name||'')+' '+(ct.last_name||'')).trim()||String(ct.full_name||'').trim();const first=cleanFirst(full);const last=cleanLast(full);const key=(first.toLowerCase().trim()+last.toLowerCase().trim()+domain).trim();if(!key){skipped++;continue;}if(cgKeys.has(key))continue;const co=cmap[domain]||{};const extras={};for(const k of Object.keys(co)){if(co[k]!==undefined&&co[k]!=='')extras[k]=co[k];}out.push({json:{...extras,'Contact Key':key,Name:full,first_name:first,last_name:last,Title:String(ct.job_title||'').trim(),Seniority:String(ct.seniority||'').trim(),Department:String(ct.function||'').trim(),Email:String(ct.email||'').trim(),Social:String(ct.linkedin_url||'').trim(),Phone:'',Connections:'',Domain:domain,Company:String(co.Company||ct.company_name||'').trim(),company_clean:String(co.Company||ct.company_name||'').trim(),'Industry Groups':co['Industry Groups']||'',Employees:co.Employees||'','Business Model':co['Business Model']||'','MX Provider':co['MX Provider']||'',Score:co.Score||'',Similarity:'',Description:co.Description||'',Keywords:co.Keywords||'',City:co.City||'',State:co.State||'','State Full':'',Country:co.Country||'',Zip:co.Zip||'',Street:co.Street||'','Run ID':runId,'Build Date':buildDate,'Tag':tag,'Contact Source':'Supersoniq'}});}}}
const sd=$getWorkflowStaticData('global');
sd.wfSkips=sd.wfSkips||{cg:0,sq:0};
sd.wfSkips.sq=skipped;
return out;