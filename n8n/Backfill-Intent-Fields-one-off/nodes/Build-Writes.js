// Build Writes: for every row of the Intent table, fill what it lacks. Four passes, each only
// writing a field the row does not already carry; rows the live machine produced are left alone.
//
//   jobs      Signal Detail -> Title, Job Title, Job Link, Job Posted, Job ID; Apify datasets
//             (joined on Job ID) -> the full job record
//   company   DiscoLike BizData per domain -> Description, Industry Groups, Employees, Revenue
//             Range, Score, Keywords, Company Status, Start Date, address, Phones, Public
//             Emails, Social URLs, MX Provider, Redirect Domain
//   role      Supersoniq match + DiscoLike count on the scraped roles -> Existing In Role
//             (highest across the sources that know the company; left blank when none does)
//   contacts  DiscoLike contact lookup, accepted only on a LinkedIn URL match -> Seniority,
//             Department, State, Phone; Contact Source = Supersoniq for rows that have none
//             (every row before 2026-08-23 came from Supersoniq)
// Writes go out in PATCH batches of 10.
const cfg=$('Parse Launch').first().json;
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const rsp=(it)=>{ const j=(it&&it.json)||{}; return { status:Number(j.statusCode)||0, body:parse(j.body===undefined?null:j.body) }; };
const join=(a)=>Array.isArray(a)?a.filter(Boolean).join(', '):'';
const kv=(o)=>o&&typeof o==='object'?Object.entries(o).map(([k,v])=>k+':'+(typeof v==='number'?v.toFixed(2):v)).join(', '):'';
const firstPhone=(p)=>Array.isArray(p)&&p.length?String((p[0]&&p[0].phone)||p[0]||''):'';
const normLi=(u)=>String(u||'').toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/+$/,'').split('?')[0];
const has=(r,k)=>{ const f=r.fields||{}; const v=f[k]; return v!==undefined&&v!==null&&String(v).trim()!==''; };
const rows=$('Fetch Rows').all().map(i=>i.json).filter(r=>r&&r.id);
const st={ rows:rows.length, parsed:0, unparsed:0, datasets:0, datasetMisses:[], jobsIndexed:0, matched:0, biz_called:0, biz_matched:0, biz_unknown:0, biz_errors:0, role_known:0, role_unknown:0, lookups:0, lookup_matched:0, lookup_nomatch:0, lookup_errors:0, rowsToWrite:0, untouched:0, batches:0, failed:[] };

// jobs pass
const jobs={};
if(cfg.do.jobs){ try{ for(const it of $('Get Dataset').all()){ const r=rsp(it); if(r.status>=200&&r.status<300&&Array.isArray(r.body)){ st.datasets++; for(const job of r.body){ const id=String(job.id||''); if(id&&!jobs[id]){ jobs[id]=job; st.jobsIndexed++; } } } else if(r.status) st.datasetMisses.push('HTTP '+r.status); } }catch(e){} }
const LEGACY=/^Hiring\s+(.+?)\s+\(posted\s+(\d{4}-\d{2}-\d{2})\)\.\s*Decision maker\s+\((.*?)\)\s+via[\s\S]*?Job:\s*(\S+)/;
const LOOSE=/^Hiring\s+(.+?)(?:\s+\(posted\s+(\d{4}-\d{2}-\d{2})\))?[\s\S]*?Job:\s*(\S+)/;
const idFromLink=(link)=>{ const m=String(link||'').match(/-(\d{8,})(?:\?|$)/); return m?m[1]:''; };

// company + role passes, by domain
const biz={}, role={};
try{
  const calls=$('Domain Calls').all().map(i=>i.json).filter(c=>c&&c.domain);
  let bz=[], sq=[], cg=[]; try{ bz=$('BizData').all(); }catch(e){} try{ sq=$('SQ Count').all(); }catch(e){} try{ cg=$('CG Count').all(); }catch(e){}
  calls.forEach((c,i)=>{
    const b=rsp(bz[i]); st.biz_called++;
    if(b.status>=200&&b.status<300&&b.body&&typeof b.body==='object'&&(b.body.domain||b.body.name)){ biz[c.domain]=b.body; st.biz_matched++; }
    else if(b.status===204||b.status===404) st.biz_unknown++;
    else if(b.status){ st.biz_errors++; st.failed.push({ name:'BizData '+c.domain, reason:'HTTP '+b.status }); }
    let known=false, count=0;
    const s=rsp(sq[i]);
    if(s.status>=200&&s.status<300&&s.body&&typeof s.body==='object'){ const m=Array.isArray(s.body.matched)?s.body.matched[0]:(Array.isArray(s.body.results)?s.body.results[0]:null); if(m&&(m.company_id||m.company_name)){ known=true; count=Math.max(count,Number(m.available_contacts)||0); } }
    const g=rsp(cg[i]);
    if(g.status>=200&&g.status<300&&g.body&&typeof g.body==='object'&&g.body.count!==undefined&&biz[c.domain]){ known=true; count=Math.max(count,Number(g.body.count)||0); }
    if(known){ role[c.domain]=count; st.role_known++; } else st.role_unknown++;
  });
}catch(e){}

// contacts pass, by row id
const contact={};
try{
  const lk=$('Contact Lookups').all().map(i=>i.json).filter(c=>c&&c.id);
  let res=[]; try{ res=$('CG Lookup').all(); }catch(e){}
  lk.forEach((c,i)=>{
    const r=rsp(res[i]); st.lookups++;
    if(!(r.status>=200&&r.status<300)||!r.body||typeof r.body!=='object'){ st.lookup_errors++; if(r.status) st.failed.push({ name:'Lookup '+c.name, reason:'HTTP '+r.status }); return; }
    const entry=(r.body.results&&(r.body.results[c.domain]||Object.values(r.body.results)[0]))||null;
    const contacts=(entry&&entry.contacts)||[];
    const want=normLi(c.linkedin);
    const hit=contacts.find(p=>Array.isArray(p.social_urls)&&p.social_urls.some(u=>normLi(u)===want));
    if(hit){ contact[c.id]=hit; st.lookup_matched++; } else st.lookup_nomatch++;
  });
}catch(e){}

const writes=[];
for(const r of rows){
  const f=r.fields||{}; const out={};
  const put=(k,v)=>{ if(v!==undefined&&v!==null&&String(v).trim()!==''&&!has(r,k)) out[k]=v; };
  // jobs
  if(cfg.do.jobs){
    const sd=String(f['Signal Detail']||'');
    let jobTitle='', posted='', contactTitle='', link='';
    let m=sd.match(LEGACY); if(m){ jobTitle=m[1]; posted=m[2]; contactTitle=m[3]; link=m[4]; } else { m=sd.match(LOOSE); if(m){ jobTitle=m[1]; posted=m[2]||''; link=m[3]; } }
    if(m){ st.parsed++;
      const jobId=has(r,'Job ID')?String(f['Job ID']):idFromLink(link);
      put('Title',contactTitle.trim()); put('Job Title',jobTitle.trim()); put('Job Link',link.replace(/[.,;]+$/,'')); put('Job Posted',posted); put('Job ID',jobId);
      const job=jobId?jobs[jobId]:null;
      if(job){ st.matched++; put('Job Description',job.descriptionText); put('Job Seniority',job.seniorityLevel); put('Job Function',job.jobFunction); put('Job Employment Type',job.employmentType); put('Job Industries',job.industries); if(!has(r,'Job Applicants')&&Number(job.applicantsCount)) out['Job Applicants']=Number(job.applicantsCount); put('Job Salary',job.salary); put('Job Poster Name',job.jobPosterName); put('Job Poster Title',job.jobPosterTitle); put('Job Poster LinkedIn',job.jobPosterProfileUrl); }
    } else st.unparsed++;
  }
  const d=String(f['Domain']||'').toLowerCase().trim();
  // company
  const b=d?biz[d]:null;
  if(cfg.do.company&&b){ const addr=b.address||{};
    put('Description',b.description); put('Industry Groups',kv(b.industry_groups)); put('Employees',b.employees); put('Revenue Range',b.revenue_range); put('Score',b.score!=null?String(b.score):''); put('Keywords',b.keywords?Object.keys(b.keywords).join(', '):'');
    put('Company Status',b.status?(b.status.status+(b.status.confidence!=null?' ('+b.status.confidence+')':'')):''); put('Start Date',b.start_date); put('Street',addr.street); put('Company City',addr.city); put('Company State',addr.state); put('Country',addr.country); put('Zip',addr.zip);
    put('Phones',join(b.phones)); put('Public Emails',join(b.public_emails)); put('Social URLs',join(b.social_urls)); put('MX Provider',b.mx_provider); put('Redirect Domain',b.redirect_domain); }
  // role
  if(cfg.do.role&&d&&role[d]!==undefined&&!has(r,'Existing In Role')) out['Existing In Role']=role[d];
  // contacts
  if(cfg.do.contacts){
    const p=contact[r.id];
    if(p){ put('Seniority',p.seniority); put('Department',p.department); put('State',p.state); put('Phone',firstPhone(p.phone)); }
    if(!has(r,'Contact Source')) out['Contact Source']='Supersoniq';
  }
  if(!Object.keys(out).length){ st.untouched++; continue; }
  writes.push({ id:r.id, fields:out });
}
st.rowsToWrite=writes.length;
const batches=[];
for(let i=0;i<writes.length;i+=10) batches.push({ json: { records:writes.slice(i,i+10), typecast:true } });
st.batches=batches.length;
if(!batches.length) return [{ json: { _empty:true, _stats:st } }];
batches[0].json._stats=st;
return batches;
