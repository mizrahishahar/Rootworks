// Build Intent Leads: one row per contact at an ICP-approved company, carrying the contact,
// the job that triggered the signal, the company's DiscoLike firmographics, the ICP reason,
// the first-hire verdict and the tier's campaign.
//
// Sources in the builders' order: ContaGen (DiscoLike /contacts/discover) every contact kept,
// then Supersoniq NET-NEW ONLY on Contact Key (first+last+domain). Provider items are
// {statusCode, body} (fullResponse + neverError) aligned by index to Contact Calls.
//
// People gate: a contact's actual title must contain one of the play's title terms and none
// of its never terms. Titles are normalised first (Chief Executive Officer -> ceo, Vice
// President -> vp) so a term written short still catches the long form. Nothing else.
// Tier: the play's rules in order, first match wins, stamped as Target Campaign.
// Company names go out raw; the Clean Fields helper writes Company / company_clean next.
const cfg=$('Parse Play').first().json;
const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};
const join=(a)=>Array.isArray(a)?a.filter(Boolean).join(', '):'';
const kv=(o)=>o&&typeof o==='object'?Object.entries(o).map(([k,v])=>k+':'+(typeof v==='number'?v.toFixed(2):v)).join(', '):'';
const firstPhone=(p)=>Array.isArray(p)&&p.length?String((p[0]&&p[0].phone)||p[0]||''):'';
const linkedinOf=(urls)=>Array.isArray(urls)?(urls.find(u=>/linkedin\.com\/in\//i.test(u))||''):'';
const body=(it)=>{ const j=(it&&it.json)||{}; if(j.statusCode!==undefined) return { status:Number(j.statusCode)||0, body:(j.body===undefined?null:j.body) }; return { status: j.error?0:200, body:j }; };
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const why=(b,raw)=>{ const m=b&&typeof b==='object'?(b.detail||b.error||b.message):null; const s=m?String(typeof m==='object'?JSON.stringify(m):m):(typeof raw==='string'?raw:(raw?JSON.stringify(raw):'')); return String(s||'empty body').slice(0,120); };

// Title normalisation: universal vocabulary, not client logic.
const SYN=[[/chief executive officer/g,'ceo'],[/chief technology officer|chief technical officer/g,'cto'],[/chief operating officer/g,'coo'],[/chief financial officer/g,'cfo'],[/chief information officer/g,'cio'],[/chief product officer/g,'cpo'],[/chief revenue officer/g,'cro'],[/chief marketing officer/g,'cmo'],[/senior vice president|executive vice president/g,'svp'],[/vice president/g,'vp'],[/co[\s-]*founder/g,'co-founder'],[/\bsr\.?\b/g,'senior'],[/&/g,'and'],[/\s+of\s+/g,' '],[/[^a-z0-9\- ]+/g,' '],[/\s+/g,' ']];
const norm=(t)=>{ let s=String(t||'').toLowerCase(); for(const [re,rep] of SYN) s=s.replace(re,rep); return s.trim(); };
const titleTerms=(cfg.people.titles||[]).map(norm).filter(Boolean);
const neverTerms=(cfg.people.never||[]).map(norm).filter(Boolean);
const passesPeople=(title)=>{ const t=norm(title); if(!t) return false; if(neverTerms.some(n=>t.includes(n))) return false; return titleTerms.some(x=>t.includes(x)); };
const tierFor=(firstHire)=>{ for(const t of (cfg.tiers||[])){ if(t.kind==='rest') return t.url; if(t.kind==='first_hire'&&t.value===firstHire) return t.url; } return ''; };

// Companies: Apply ICP rows (company + biz + reason), Contact Calls rows (first hire + bodies).
const companies={};
for(const it of $('Apply ICP').all()){ const j=it.json||{}; if(j.domain) companies[j.domain]=j; }
const calls=$('Contact Calls').all().map(i=>i.json).filter(c=>c&&c.domain);
const callByDomain={}; for(const c of calls) callByDomain[c.domain]=c;

const failed=[];
const out=[];
const seenKey=new Set(); const seenLi=new Set();
const nowIso=new Date().toISOString();
const gate={ checked:0, dropped_never:0, dropped_no_title:0 };
const tiers={};

function baseRow(d){
  const e=companies[d]||{}; const c=e.company||{}; const b=e.biz||{}; const j=c.job||{}; const addr=b.address||{}; const cc=callByDomain[d]||{};
  const firstHire=cc.first_hire||'Unknown';
  const target=tierFor(firstHire);
  return {
    'Domain': d,
    'Company': String(c.company||b.name||'').trim(),
    'company_clean': String(c.company||b.name||'').trim(),
    'Event Type': cfg.event_type,
    'Target Campaign': target,
    'Intent Status': 'NEW',
    'detected_at': nowIso,
    'ICP Reason': e.icp_reason||'',
    'Existing In Role': cc.existing_in_role,
    'First Hire': firstHire,
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
    'Email Pattern': patterns[d]||''
  };
}
const patterns={};
function signal(d){ const c=(companies[d]||{}).company||{}; const j=c.job||{}; const cc=callByDomain[d]||{}; return 'Hiring '+(j.title||'a role')+(j.posted_at?' (posted '+j.posted_at+')':'')+' · first hire '+(cc.first_hire||'Unknown')+(cc.existing_in_role!=null?' ('+cc.existing_in_role+' in role today)':'')+'. Job: '+(j.link||''); }
function push(d,p,source){
  const full=String(p.name||'').trim();
  const first=cleanFirst(full), last=cleanLast(full);
  const key=(first.toLowerCase()+last.toLowerCase()+d).trim();
  const li=String(p.linkedin||'').trim();
  if(!key||!first) return 'nokey';
  if(seenKey.has(key)||(li&&seenLi.has(li.toLowerCase()))) return 'dup';
  gate.checked++;
  const t=norm(p.title);
  if(neverTerms.some(n=>t.includes(n))){ gate.dropped_never++; return 'never'; }
  if(!titleTerms.some(x=>t.includes(x))){ gate.dropped_no_title++; return 'notitle'; }
  seenKey.add(key); if(li) seenLi.add(li.toLowerCase());
  const row=Object.assign(baseRow(d), {
    'Name': full, 'first_name': first, 'last_name': last,
    'LinkedIn URL': li, 'Email': String(p.email||'').trim(),
    'Title': String(p.title||'').trim(), 'Seniority': String(p.seniority||'').trim(), 'Department': String(p.department||'').trim(),
    'Phone': p.phone||'', 'City': p.city||'', 'State': p.state||'',
    'Contact Key': key, 'Contact Source': source,
    'Signal Detail': signal(d)+' · '+source+' · '+(p.title||'')
  });
  tiers[row['Target Campaign']]=(tiers[row['Target Campaign']]||0)+1;
  out.push({ json: row });
  return 'ok';
}

// Source 1: ContaGen.
const cg={called:0,matched:0,contacts:0,kept:0,errors:0};
let cgItems=[]; try{ cgItems=$('ContaGen Contacts').all(); }catch(e){}
cgItems.forEach((it,i)=>{
  const call=calls[i]; if(!call||!companies[call.domain]) return;
  cg.called++;
  const r=body(it); const b=parse(r.body);
  if(!(r.status>=200&&r.status<300)||!b||typeof b!=='object'){ cg.errors++; failed.push({ tier:'ContaGen', name:call.domain, reason:'HTTP '+r.status+' '+why(b,r.body) }); return; }
  const entry=(b.results&&(b.results[call.domain]||Object.values(b.results)[0]))||null;
  const contacts=(entry&&entry.contacts)||[];
  if(contacts.length) cg.matched++;
  const pattern=entry&&entry.email_pattern?entry.email_pattern+(entry.email_pattern_confidence!=null?' ('+entry.email_pattern_confidence+')':''):'';
  if(pattern&&!patterns[call.domain]) patterns[call.domain]=pattern;
  const e=companies[call.domain];
  if(entry&&!e.biz) e.biz={ name:entry.name, employees:entry.employees, revenue_range:entry.revenue_range, industry_groups:entry.industry_groups, address:entry.address };
  else if(entry&&e.biz&&!e.biz.revenue_range&&entry.revenue_range) e.biz.revenue_range=entry.revenue_range;
  for(const p of contacts){
    cg.contacts++;
    if(push(call.domain,{ name:p.name, title:p.title, seniority:p.seniority, department:p.department, email:p.email, linkedin:linkedinOf(p.social_urls), phone:firstPhone(p.phone), city:'', state:p.state||'' },'ContaGen')==='ok') cg.kept++;
  }
});

// Source 2: Supersoniq, net-new only.
const sq={called:0,matched:0,contacts:0,kept:0,errors:0,credits:0};
let sqItems=[]; try{ sqItems=$('Supersoniq Contacts').all(); }catch(e){}
sqItems.forEach((it,i)=>{
  const call=calls[i]; if(!call||!companies[call.domain]) return;
  sq.called++;
  const r=body(it); const b=parse(r.body);
  if(!(r.status>=200&&r.status<300)||!b||typeof b!=='object'||b.success===false){ sq.errors++; failed.push({ tier:'Supersoniq', name:call.domain, reason:'HTTP '+r.status+' '+why(b,r.body) }); return; }
  sq.credits+=Number(b.credits_used)||0;
  const comps=Array.isArray(b.results)?b.results:[];
  let any=false;
  for(const comp of comps){
    const contacts=Array.isArray(comp.contacts)?comp.contacts:[comp];
    for(const p of contacts){
      if(!p||!(p.first_name||p.full_name)) continue;
      any=true; sq.contacts++;
      const full=p.full_name||((p.first_name||'')+' '+(p.last_name||'')).trim();
      if(push(call.domain,{ name:full, title:p.job_title, seniority:p.seniority, department:p.function, email:p.email, linkedin:p.linkedin_url, phone:'', city:p.contact_city||'', state:p.contact_region||'' },'Supersoniq')==='ok') sq.kept++;
    }
  }
  if(any) sq.matched++;
});

const companiesWithContact=new Set(out.map(o=>o.json.Domain)).size;
const stats={ companies:Object.keys(companies).length, companies_with_contact:companiesWithContact, contacts:out.length, contagen:cg, supersoniq:sq, people_gate:gate, tiers, failed };
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
