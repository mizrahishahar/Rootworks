const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};

const rows=$('Read CSV').all().map(i=>i.json);

const RESERVED=new Set(['Name','Domain','domain','company_domain','Email','Verified','Company','State','first_name','last_name','company_clean','State Full','segment','query_name','ingested_at','Run ID','RankInCompany','Contact Source','Build Date','Tag']);
const ROW_ONLY=new Set(['Title','Seniority','Department','Social','Phone','Connections','Similarity']);
const COMPANY_COLS=['Business Model','MX Provider'];

const cmap={};
for(const r of rows){
  const d=String(r.Domain||r.domain||r.company_domain||'').trim().toLowerCase();
  if(!d) continue;
  const c=cmap[d]||(cmap[d]={});
  for(const k of Object.keys(r)){
    if(RESERVED.has(k)||ROW_ONLY.has(k)) continue;
    const v=r[k];
    if((c[k]===undefined||c[k]==='') && v!==undefined && String(v).trim()!=='') c[k]=String(v).trim();
  }
  for(const k of COMPANY_COLS){ if(c[k]===undefined) c[k]=''; }
}

const runId=String($execution.id);
const tag=((($('Waterfall Upload').first().json['Tag'])||'')+'').trim();
const _st=($('Config').first().json||{}).startedAt;
let buildDate='';
try{ buildDate=DateTime.fromISO(String(_st)).toFormat('yyyy-MM-dd'); }catch(e){ buildDate=''; }
if(!buildDate||buildDate==='Invalid DateTime'){ buildDate=$now.toFormat('yyyy-MM-dd'); }
let skipped=0;
const out=[];
for(const r of rows){
  const name=String(r.Name||'').trim();
  const domain=String(r.Domain||r.domain||'').trim().toLowerCase();
  const first=cleanFirst(name);
  const last=cleanLast(name);
  const key=(first.toLowerCase().trim()+last.toLowerCase().trim()+domain).trim();
  if(!key){ skipped++; continue; }
  if(!name) continue;
  const co=cmap[domain]||{};

  const passthrough={};
  for(const k of Object.keys(r)){
    if(RESERVED.has(k)) continue;
    const v=r[k];
    passthrough[k]=(v===undefined||v===null)?'':String(v).trim();
  }
  for(const k of Object.keys(co)){
    if(co[k]!==undefined && co[k]!=='') passthrough[k]=co[k];
  }

  out.push({json:{
    ...passthrough,
    'Contact Key':key,
    Name:name,
    first_name:first,
    last_name:last,
    Domain:domain,
    // Raw here; the Clean Fields helper (next node) writes the cleaned Company / company_clean / State Full.
    Company:String(co.Company||r.Company||'').trim(),
    company_clean:String(co.Company||r.Company||'').trim(),
    State:co.State||String(r.State||'').trim(),
    'State Full':'',
    'Business Model':co['Business Model']||'',
    'MX Provider':co['MX Provider']||'',
    Email:String(r.Email||'').trim(),
    'Run ID':runId,
    'Build Date':buildDate,
    'Tag':tag,
    'Contact Source':'ContaGen'
  }});
}
const sd=$getWorkflowStaticData('global');
sd.wfSkips=sd.wfSkips||{cg:0,sq:0};
sd.wfSkips.cg=skipped;
return out;