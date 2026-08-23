// Build Intent Leads: merges the three provider passes into one row per contact, carrying the
// contact, the job that triggered the signal, and the company's DiscoLike firmographics.
//
// Sources, in the builders' order (Contagen -> Supersoniq -> Clayroots):
//   ContaGen   DiscoLike /contacts/discover, Source 1, every contact kept.
//   Supersoniq Source 2, NET-NEW ONLY: a contact whose Contact Key (first+last+domain) already
//              came from ContaGen is skipped, exactly as Format Supersoniq does.
//   BizData    DiscoLike /bizdata, one call per company, firmographics on every row.
//
// Each HTTP node ran with fullResponse + neverError, so every item here is {statusCode, body}
// and a failed call is READ, classified and counted, never silently dropped. Index alignment:
// provider output i belongs to Split Calls row i (one output per input, order preserved);
// BizData output i belongs to Filter & Qualify row i.
//
// Company names go out RAW; the Clean Fields helper (next node) is the one copy of the
// cleaning rules and writes Company / company_clean / public_emails_clean in place.
// Field names are the ClayRoots build vocabulary; Job * fields are this table's own.
const cfg=$('Parse Config').first().json;
const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};
const join=(a)=>Array.isArray(a)?a.filter(Boolean).join(', '):'';
const kv=(o)=>o&&typeof o==='object'?Object.entries(o).map(([k,v])=>k+':'+(typeof v==='number'?v.toFixed(2):v)).join(', '):'';
const firstPhone=(p)=>Array.isArray(p)&&p.length?String((p[0]&&p[0].phone)||p[0]||''):'';
const linkedinOf=(urls)=>Array.isArray(urls)?(urls.find(u=>/linkedin\.com\/in\//i.test(u))||''):'';
// fullResponse shape is {statusCode, headers, body}; a 204 carries statusCode and NO body key.
const body=(it)=>{ const j=(it&&it.json)||{}; if(j.statusCode!==undefined) return { status:Number(j.statusCode)||0, body:(j.body===undefined?null:j.body) }; return { status: j.error?0:200, body:j }; };
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const why=(b,raw)=>{ const m=b&&typeof b==='object'?(b.detail||b.error||b.message):null; const s=m?String(typeof m==='object'?JSON.stringify(m):m):(typeof raw==='string'?raw:(raw?JSON.stringify(raw):'')); return String(s||'empty body').slice(0,120); };

// Companies, indexed by domain, with the job that put them here.
const companies={};
const companyRows=$('Filter & Qualify Jobs').all().map(i=>i.json).filter(c=>c&&c.domain);
for(const c of companyRows) companies[c.domain]=c;

// BizData, aligned to companyRows by index; body.domain confirms the match when present.
const failed=[];
const biz={};
const bizStats={called:0,matched:0,errors:0};
let bizItems=[]; try{ bizItems=$('DiscoLike BizData').all(); }catch(e){}
bizItems.forEach((it,i)=>{
  const c=companyRows[i]; if(!c) return;
  bizStats.called++;
  const r=body(it); const b=parse(r.body);
  if(r.status>=200&&r.status<300&&b&&typeof b==='object'&&(b.domain||b.name)){ biz[c.domain]=b; bizStats.matched++; return; }
  // 204 No Content and 404 are DiscoLike's "domain unknown": a miss, not an error (proven live 2026-08-23, indie-soft.com).
  if(r.status===204||r.status===404||(b&&b.detail&&/not found/i.test(String(b.detail)))){ bizStats.unknown=(bizStats.unknown||0)+1; return; }
  bizStats.errors++; failed.push({ tier:'BizData', name:c.domain, reason:'HTTP '+r.status+' '+why(b,r.body) });
});

// Split Calls already dropped recruiter platforms on DiscoLike's classification before any
// paid contact call; it reports them on its first row for the log.
let recruiterDrop=[]; try{ recruiterDrop=($('Split Calls').first().json._stats||{}).recruiter_bizdata||[]; }catch(e){}
for(const d of recruiterDrop) delete companies[d];

const calls=$('Split Calls').all().map(i=>i.json).filter(c=>c&&c.domain);
const out=[];
const seenKey=new Set(); const seenLi=new Set();
const nowIso=new Date().toISOString();

function baseRow(c){
  const b=biz[c.domain]||{};
  const j=c.job||{};
  const addr=b.address||{};
  return {
    'Domain': c.domain,
    'Company': String(c.company||b.name||'').trim(),
    'company_clean': String(c.company||b.name||'').trim(),
    'Event Type': cfg.event_type,
    'Target Campaign': cfg.campaign_url,
    'Intent Status': 'NEW',
    'detected_at': nowIso,
    'Job ID': j.id||'', 'Job Title': j.title||'', 'Job Link': j.link||'', 'Job Posted': j.posted_at||null,
    'Job Description': j.description||'', 'Job Seniority': j.seniority||'', 'Job Function': j.function||'',
    'Job Employment Type': j.employment_type||'', 'Job Industries': j.industries||'', 'Job Applicants': j.applicants,
    'Job Salary': j.salary||'', 'Job Poster Name': j.poster_name||'', 'Job Poster Title': j.poster_title||'', 'Job Poster LinkedIn': j.poster_linkedin||'',
    'Description': b.description||'', 'Industry Groups': kv(b.industry_groups), 'Employees': b.employees||'',
    'Revenue Range': b.revenue_range||'', 'Score': b.score!=null?String(b.score):'', 'Keywords': b.keywords?Object.keys(b.keywords).join(', '):'',
    'Company Status': b.status?(b.status.status+(b.status.confidence!=null?' ('+b.status.confidence+')':'')):'',
    'Start Date': b.start_date||'', 'Street': addr.street||'', 'Company City': addr.city||'', 'Company State': addr.state||'',
    'Country': addr.country||c.country||'', 'Zip': addr.zip||'',
    'Phones': join(b.phones), 'Public Emails': join(b.public_emails), 'public_emails_clean': '',
    'Social URLs': join(b.social_urls), 'MX Provider': b.mx_provider||'', 'Redirect Domain': b.redirect_domain||'',
    'Email Pattern': patterns[c.domain]||''
  };
}
const patterns={};
function signal(c){ const j=c.job||{}; return 'Hiring '+(j.title||'an infrastructure role')+(j.posted_at?' (posted '+j.posted_at+')':'')+(c.headcount?' · '+c.headcount+' employees on LinkedIn':'')+'. Job: '+(j.link||''); }
function push(c,p,source,callName){
  const full=String(p.name||'').trim();
  const first=cleanFirst(full), last=cleanLast(full);
  const key=(first.toLowerCase()+last.toLowerCase()+c.domain).trim();
  const li=String(p.linkedin||'').trim();
  if(!key||!first) return 'nokey';
  if(seenKey.has(key)||(li&&seenLi.has(li.toLowerCase()))) return 'dup';
  seenKey.add(key); if(li) seenLi.add(li.toLowerCase());
  out.push({ json: Object.assign(baseRow(c), {
    'Name': full, 'first_name': first, 'last_name': last,
    'LinkedIn URL': li, 'Email': String(p.email||'').trim(),
    'Title': String(p.title||'').trim(), 'Seniority': String(p.seniority||'').trim(), 'Department': String(p.department||'').trim(),
    'Phone': p.phone||'', 'City': p.city||'', 'State': p.state||'',
    'Contact Key': key, 'Contact Source': source,
    'Signal Detail': signal(c)+' · '+source+' '+callName+' · '+(p.title||'')
  })});
  return 'ok';
}

// Source 1: ContaGen.
const cg={called:0,matched:0,contacts:0,kept:0,errors:0};
let cgItems=[]; try{ cgItems=$('ContaGen Contacts').all(); }catch(e){}
cgItems.forEach((it,i)=>{
  const call=calls[i]; if(!call) return; const c=companies[call.domain]; if(!c) return;
  cg.called++;
  const r=body(it); const b=parse(r.body);
  if(!(r.status>=200&&r.status<300)||!b||typeof b!=='object'){ cg.errors++; failed.push({ tier:'ContaGen', name:call.domain+' ('+call.call+')', reason:'HTTP '+r.status+' '+why(b,r.body) }); return; }
  const entry=(b.results&&(b.results[call.domain]||Object.values(b.results)[0]))||null;
  const contacts=(entry&&entry.contacts)||[];
  if(contacts.length) cg.matched++;
  const pattern=entry&&entry.email_pattern?entry.email_pattern+(entry.email_pattern_confidence!=null?' ('+entry.email_pattern_confidence+')':''):'';
  if(pattern&&!patterns[c.domain]) patterns[c.domain]=pattern;
  if(entry&&!biz[c.domain]){ biz[c.domain]={ name:entry.name, employees:entry.employees, revenue_range:entry.revenue_range, industry_groups:entry.industry_groups, address:entry.address }; }
  else if(entry&&biz[c.domain]&&!biz[c.domain].revenue_range&&entry.revenue_range) biz[c.domain].revenue_range=entry.revenue_range;
  for(const p of contacts){
    cg.contacts++;
    const res=push(c,{ name:p.name, title:p.title, seniority:p.seniority, department:p.department, email:p.email, linkedin:linkedinOf(p.social_urls), phone:firstPhone(p.phone), city:'', state:p.state||'', email_pattern:pattern },'ContaGen',call.call);
    if(res==='ok') cg.kept++;
  }
});

// Source 2: Supersoniq, net-new only.
const sq={called:0,matched:0,contacts:0,kept:0,errors:0,credits:0};
let sqItems=[]; try{ sqItems=$('Supersoniq Contacts').all(); }catch(e){}
sqItems.forEach((it,i)=>{
  const call=calls[i]; if(!call) return; const c=companies[call.domain]; if(!c) return;
  sq.called++;
  const r=body(it); const b=parse(r.body);
  if(!(r.status>=200&&r.status<300)||!b||typeof b!=='object'||b.success===false){ sq.errors++; failed.push({ tier:'Supersoniq', name:call.domain+' ('+call.call+')', reason:'HTTP '+r.status+' '+why(b,r.body) }); return; }
  sq.credits+=Number(b.credits_used)||0;
  const comps=Array.isArray(b.results)?b.results:[];
  let any=false;
  for(const comp of comps){
    const contacts=Array.isArray(comp.contacts)?comp.contacts:[comp];
    for(const p of contacts){
      if(!p||!(p.first_name||p.full_name)) continue;
      any=true; sq.contacts++;
      const full=p.full_name||((p.first_name||'')+' '+(p.last_name||'')).trim();
      const res=push(c,{ name:full, title:p.job_title, seniority:p.seniority, department:p.function, email:p.email, linkedin:p.linkedin_url, phone:'', city:p.contact_city||'', state:p.contact_region||'' },'Supersoniq',call.call);
      if(res==='ok') sq.kept++;
    }
  }
  if(any) sq.matched++;
});

const companiesWithContact=new Set(out.map(o=>o.json.Domain)).size;
const stats={ companies:companyRows.length, recruiter_bizdata:recruiterDrop, companies_with_contact:companiesWithContact, contacts:out.length, contagen:cg, supersoniq:sq, bizdata:bizStats, failed };
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
