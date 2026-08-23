// Build Writes: for every row of the Intent table, derive what the old writer never stored.
//
//   From Signal Detail (every row, legacy format):
//     "Hiring {job title} (posted {date}). Decision maker ({contact title}) via ... Job: {link}"
//     -> Title (only when empty), Job Title, Job Link, Job Posted, Job ID (from the link)
//   From the Apify datasets still retrievable, joined on Job ID:
//     -> Job Description, Job Seniority, Job Function, Job Employment Type, Job Industries,
//        Job Applicants, Job Salary, Job Poster Name / Title / LinkedIn
//
// A field is written only when the row does not already carry it; rows the new writer
// produced are left alone. Writes go out in PATCH batches of 10 ({records:[...]}).
const rows=$('Fetch Rows').all().map(i=>i.json).filter(r=>r&&r.id);

// Index every job the datasets returned, by LinkedIn job id.
const jobs={};
let datasets=0, jobsIndexed=0, datasetMisses=[];
for(const it of $('Get Dataset').all()){
  const j=it.json||{};
  const status=Number(j.statusCode)||0;
  let body=j.body; if(typeof body==='string'){ try{ body=JSON.parse(body); }catch(e){ body=null; } }
  if(status>=200&&status<300&&Array.isArray(body)){ datasets++; for(const job of body){ const id=String(job.id||''); if(id&&!jobs[id]){ jobs[id]=job; jobsIndexed++; } } }
  else if(j.datasetId||status){ datasetMisses.push('HTTP '+status); }
}

const LEGACY=/^Hiring\s+(.+?)\s+\(posted\s+(\d{4}-\d{2}-\d{2})\)\.\s*Decision maker\s+\((.*?)\)\s+via[\s\S]*?Job:\s*(\S+)/;
const LOOSE=/^Hiring\s+(.+?)(?:\s+\(posted\s+(\d{4}-\d{2}-\d{2})\))?[\s\S]*?Job:\s*(\S+)/;
const idFromLink=(link)=>{ const m=String(link||'').match(/-(\d{8,})(?:\?|$)/); return m?m[1]:''; };
const has=(r,k)=>{ const f=r.fields||{}; const v=f[k]; return v!==undefined&&v!==null&&String(v).trim()!==''; };

let parsed=0, matched=0, untouched=0, unparsed=0;
const writes=[];
for(const r of rows){
  const f=r.fields||{};
  const sd=String(f['Signal Detail']||'');
  let jobTitle='', posted='', contactTitle='', link='';
  let m=sd.match(LEGACY);
  if(m){ jobTitle=m[1]; posted=m[2]; contactTitle=m[3]; link=m[4]; }
  else { m=sd.match(LOOSE); if(m){ jobTitle=m[1]; posted=m[2]||''; link=m[3]; } }
  if(!m){ unparsed++; continue; }
  parsed++;
  const jobId=has(r,'Job ID')?String(f['Job ID']):idFromLink(link);
  const out={};
  if(contactTitle&&!has(r,'Title')) out['Title']=contactTitle.trim();
  if(jobTitle&&!has(r,'Job Title')) out['Job Title']=jobTitle.trim();
  if(link&&!has(r,'Job Link')) out['Job Link']=link.replace(/[.,;]+$/,'');
  if(posted&&!has(r,'Job Posted')) out['Job Posted']=posted;
  if(jobId&&!has(r,'Job ID')) out['Job ID']=jobId;
  const job=jobId?jobs[jobId]:null;
  if(job){
    matched++;
    const put=(k,v)=>{ if(v!==undefined&&v!==null&&String(v).trim()!==''&&!has(r,k)) out[k]=v; };
    put('Job Description',job.descriptionText);
    put('Job Seniority',job.seniorityLevel);
    put('Job Function',job.jobFunction);
    put('Job Employment Type',job.employmentType);
    put('Job Industries',job.industries);
    if(!has(r,'Job Applicants')&&Number(job.applicantsCount)) out['Job Applicants']=Number(job.applicantsCount);
    put('Job Salary',job.salary);
    put('Job Poster Name',job.jobPosterName);
    put('Job Poster Title',job.jobPosterTitle);
    put('Job Poster LinkedIn',job.jobPosterProfileUrl);
  }
  if(!Object.keys(out).length){ untouched++; continue; }
  writes.push({ id:r.id, fields:out });
}

const batches=[];
for(let i=0;i<writes.length;i+=10) batches.push({ json: { records:writes.slice(i,i+10), typecast:true } });
const stats={ rows:rows.length, parsed, unparsed, datasets, datasetMisses, jobsIndexed, matched, rowsToWrite:writes.length, untouched, batches:batches.length };
if(!batches.length) return [{ json: { _empty:true, _stats:stats } }];
batches[0].json._stats=stats;
return batches;
