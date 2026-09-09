// Merge People (the writer helper): one provider's people for one chunk of companies, merged into
// the register's People shape against what the base already holds. Rules (ruled 2026-09-08):
//   Keys: Contact Key (cleaned first + last + domain), then the LinkedIn slug. A held person is
//     UPDATED, blanks filled, nothing overwritten; two rows naming the same person merge.
//   Priority: the lanes run in priority order (Blitz, GetLeads, QuickEnrich, Supersoniq), so the
//     held row is always the higher-priority writer and first-writer-wins holds by construction.
//   Email: appended, deduped, never replaced. LinkedIn URL only when its slug contains the first
//     or last name. Contact Source: the provider added to the held list (a single value when the
//     base still carries a single select). Seniority and Department from the provider, else from
//     the title. The vocabularies come from the register (@@register); a map target the register
//     does not carry fails here.
// @@register
const inp=$('Writer Trigger').first().json||{};
const provider=String(inp.provider||'');
const have=new Set(inp.peopleFields||[]);
const multi=inp.contactSourceMulti===true;
const people=(inp.people&&typeof inp.people==='object')?inp.people:{};
const companies=Array.isArray(inp.companies)?inp.companies:[];
let heldRows=[]; try{ heldRows=$('Read Held').all().map(i=>i.json||{}).filter(j=>j.id); }catch(e){}
const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};
const PEOPLE=REGISTER.tables.find(t=>t.name==='People');
const choices=(n)=>new Set(PEOPLE.fields.find(f=>f.name===n).options.choices.map(c=>c.name));
const SENIORITY=choices('Seniority'), DEPARTMENT=choices('Department');
const SEN={ 'executive':'Executive', 'c-suite':'C-Suite', 'c_suite':'C-Suite', 'csuite':'C-Suite', 'c-team':'C-Suite', 'cxo':'C-Suite', 'founder':'Founder', 'owner':'Owner', 'president':'President', 'vp':'VP', 'vice president':'VP', 'head':'Head', 'director':'Director', 'manager':'Manager', 'senior manager':'Manager', 'senior':'Senior', 'senior_ic':'Senior', 'staff':'Senior', 'mid_level':'Senior', 'partner':'Partner', 'evp / svp':'EVP / SVP', 'evp':'EVP / SVP', 'svp':'EVP / SVP', 'board / chair':'Board / Chair', 'board':'Board / Chair', 'chair':'Board / Chair', 'unclassified':'Unclassified', 'other':'Unclassified' };
const TITLE_SEN=[ [/\b(co-?founder|founder|founding)\b/i,'Founder'], [/\b(owner|proprietor)\b/i,'Owner'], [/\b(chairman|chairwoman|chairperson|chair|board member)\b/i,'Board / Chair'], [/\b(chief\s+[a-z ]+?\s+officer|ceo|cto|cfo|coo|cmo|cro|cio|ciso|cpo|chro|cco|cso|cdo|cao)\b/i,'C-Suite'], [/\bpresident\b/i,'President'], [/\b(evp|svp|executive vice president|senior vice president)\b/i,'EVP / SVP'], [/\b(vp|vice president|vice-president)\b/i,'VP'], [/\bhead\b/i,'Head'], [/\bdirector\b/i,'Director'], [/\bmanager\b/i,'Manager'], [/\b(general partner|managing partner|partner)\b/i,'Partner'], [/\b(senior|sr\.?|lead|principal|staff)\b/i,'Senior'] ];
const mapSen=(raw,title)=>{ const t=String(title||''); for(const pair of TITLE_SEN){ if(pair[0].test(t)){ if(pair[1]==='President'&&/\bvice/i.test(t)) continue; return pair[1]; } } return SEN[String(raw||'').trim().toLowerCase()]||'Unclassified'; };
const DEP={ 'executive':'Executive', 'general business & management':'Executive', 'engineering':'Engineering', 'technology':'Technology', 'it':'Technology', 'information technology':'Technology', 'r&d':'R&D', 'research & development':'R&D', 'research and development':'R&D', 'research':'R&D', 'science':'R&D', 'product':'Product', 'product management':'Product', 'data':'Data', 'data science':'Data', 'analytics':'Data', 'security':'Security', 'information security':'Security', 'design':'Design', 'art, culture and creative professionals':'Design', 'operations':'Operations', 'manufacturing & production':'Operations', 'sales':'Sales', 'sales - marketing':'Sales', 'sales & business development':'Sales', 'business development':'Sales', 'marketing':'Marketing', 'advertising & marketing':'Marketing', 'finance':'Finance', 'finance & accounting':'Finance', 'accounting':'Finance', 'human resources':'Human Resources', 'hr':'Human Resources', 'people':'Human Resources', 'customer success':'Customer Success', 'customer service':'Customer Success', 'customer/client service':'Customer Success', 'support':'Customer Success', 'project management':'Project Management', 'strategy':'Strategy', 'legal':'Legal', 'supply chain':'Supply Chain', 'supply chain & logistics':'Supply Chain', 'logistics':'Supply Chain', 'procurement':'Supply Chain', 'purchasing':'Supply Chain', 'communications':'Communications', 'public relations':'Communications', 'writing/editing':'Communications', 'community':'Community & Social', 'community & social':'Community & Social', 'social':'Community & Social', 'compliance':'Compliance & GRC', 'compliance & grc':'Compliance & GRC', 'grc':'Compliance & GRC', 'risk':'Compliance & GRC' };
const TITLE_DEP=[ [/\b(ceo|founder|owner|president|chief executive|managing director|general manager)\b/i,'Executive'], [/\b(cto|engineer|engineering|developer|software|architect)\b/i,'Engineering'], [/\b(devops|sre|infrastructure|cloud|platform|it\b|information technology|cio|sysadmin|systems)\b/i,'Technology'], [/\b(security|ciso|infosec)\b/i,'Security'], [/\b(data|analytics|bi\b|machine learning|ai\b)\b/i,'Data'], [/\b(product)\b/i,'Product'], [/\b(design|ux|ui\b|creative)\b/i,'Design'], [/\b(sales|account executive|business development|revenue|cro)\b/i,'Sales'], [/\b(marketing|growth|demand|brand|content|seo|cmo)\b/i,'Marketing'], [/\b(finance|financial|accounting|controller|cfo|treasur)\b/i,'Finance'], [/\b(human resources|hr\b|people|talent|recruit|chro)\b/i,'Human Resources'], [/\b(customer success|customer support|support|customer experience)\b/i,'Customer Success'], [/\b(legal|counsel|attorney)\b/i,'Legal'], [/\b(compliance|risk|grc|audit)\b/i,'Compliance & GRC'], [/\b(supply chain|logistics|procurement|purchasing)\b/i,'Supply Chain'], [/\b(project|program|pmo)\b/i,'Project Management'], [/\b(operations|ops\b|coo)\b/i,'Operations'], [/\b(communications|pr\b|public relations)\b/i,'Communications'], [/\b(strategy)\b/i,'Strategy'] ];
const mapDep=(raw,title)=>{ for(const part of String(raw||'').split(/[,;|]/)){ const m=DEP[part.trim().toLowerCase()]; if(m) return m; } const t=String(title||''); for(const pair of TITLE_DEP){ if(pair[0].test(t)) return pair[1]; } return ''; };
for(const v of Object.values(SEN).concat(TITLE_SEN.map(x=>x[1]))){ if(!SENIORITY.has(v)) throw new Error('Merge People: Seniority "'+v+'" is not on the register'); }
for(const v of Object.values(DEP).concat(TITLE_DEP.map(x=>x[1]))){ if(!DEPARTMENT.has(v)) throw new Error('Merge People: Department "'+v+'" is not on the register'); }
const slugOf=(u)=>{ const m=String(u||'').toLowerCase().match(/linkedin\.com\/in\/([^\/?#]+)/); return m?m[1].replace(/\/+$/,'').trim():''; };
const fenceOk=(slug,first,last)=>{ if(!slug) return false; const s=slug.replace(/[^a-z0-9]/g,''); const f=String(first||'').toLowerCase().replace(/[^a-z]/g,''); const l=String(last||'').toLowerCase().replace(/[^a-z]/g,''); return (f.length>=2&&s.indexOf(f)>-1)||(l.length>=3&&s.indexOf(l)>-1); };
const splitEmails=(s)=>String(s||'').split(/[,;\s]+/).map(e=>e.trim().toLowerCase()).filter(e=>e.indexOf('@')>0);
const one=(v)=>String(Array.isArray(v)?(v[0]||''):(v==null?'':v)).trim();
const many=(v)=>Array.isArray(v)?v.map(x=>(x&&typeof x==='object')?String(x.name||''):String(x)).filter(Boolean):(v?[String((v&&typeof v==='object')?(v.name||''):v)].filter(Boolean):[]);
const heldByDomain={};
for(const h of heldRows){ const f=h.fields||{}; const d=one(f.Domain).toLowerCase(); if(!d) continue; (heldByDomain[d]=heldByDomain[d]||[]).push({ id:h.id, key:one(f['Contact Key']).toLowerCase(), held:true, fields:{ Title:one(f.Title), Seniority:one(f.Seniority), Department:one(f.Department), 'LinkedIn URL':one(f['LinkedIn URL']), Phone:one(f.Phone), 'Source ID':one(f['Source ID']) }, emails:splitEmails(one(f.Email)), sources:many(f['Contact Source']), changes:{}, emailChanged:false, sourceChanged:false }); }
const stats={ returned:0, built:0, updated:0, heldUnchanged:0, dupes:0, noKey:0, fenced:0, emailsAppended:0, singleSelectSource:!multi, coveredDomains:[] };
const out=[];
for(const c of companies){
  const domain=String(c.domain||'').toLowerCase(); if(!domain) continue;
  const list=people[domain]||[];
  const heldByKey={}, heldBySlug={};
  for(const rec of (heldByDomain[domain]||[])){ if(rec.key) heldByKey[rec.key]=rec; const s=slugOf(rec.fields['LinkedIn URL']); if(s) heldBySlug[s]=rec; }
  const newByKey={}, newBySlug={}; const rows=[];
  for(const person of list){
    stats.returned++;
    const full=String(person.name||'').trim();
    const first=cleanFirst(full), last=cleanLast(full);
    if(!first){ stats.noKey++; continue; }
    const key=(first.toLowerCase()+last.toLowerCase()+domain).trim();
    const rawLi=String(person.linkedin||'').trim(); const slug=slugOf(rawLi);
    const li=(rawLi&&fenceOk(slug,first,last))?rawLi:''; if(rawLi&&!li) stats.fenced++;
    const email=String(person.email||'').trim().toLowerCase();
    const incoming={ Title:String(person.title||'').trim(), Seniority:mapSen(person.seniority, person.title), Department:mapDep(person.department, person.title), 'LinkedIn URL':li, Phone:String(person.phone||'').trim(), 'Source ID':String(person.sourceId||'').trim() };
    let target=newByKey[key]||(li&&newBySlug[slug])||heldByKey[key]||(li&&heldBySlug[slug])||null;
    if(!target){ target={ id:'', key, held:false, fields:incoming, emails:email?[email]:[], sources:[provider], name:full }; newByKey[key]=target; if(li) newBySlug[slug]=target; rows.push(target); stats.built++; continue; }
    if(!target.held) stats.dupes++;
    for(const k of Object.keys(incoming)){ const cur=String(target.fields[k]||''); const nv=incoming[k]; const blank=!cur||(k==='Seniority'&&cur==='Unclassified'); if(blank&&nv&&nv!==cur){ target.fields[k]=nv; if(target.held) target.changes[k]=nv; } }
    if(email&&target.emails.indexOf(email)<0){ target.emails.push(email); if(target.held){ target.emailChanged=true; stats.emailsAppended++; } }
    if(target.sources.indexOf(provider)<0){ target.sources.push(provider); if(target.held) target.sourceChanged=true; }
  }
  let covered=(heldByDomain[domain]||[]).length>0;
  for(const r of rows){
    covered=true;
    const row={ 'Name':r.name, 'Title':r.fields.Title, 'Seniority':r.fields.Seniority, 'Department':r.fields.Department, 'Email':r.emails.join(', '), 'LinkedIn URL':r.fields['LinkedIn URL'], 'Phone':r.fields.Phone, 'Companies':[c.recordId], 'Contact Key':r.key, 'Contact Source':(multi?r.sources.slice():r.sources[0]), 'Source ID':r.fields['Source ID'], '_domain':domain };
    if(!row.Department) delete row.Department;
    for(const k of Object.keys(row)){ if(k.charAt(0)==='_') continue; if(!have.has(k)) delete row[k]; }
    out.push({ json:row });
  }
  for(const rec of (heldByDomain[domain]||[])){
    const changed=Object.keys(rec.changes).length||rec.emailChanged||rec.sourceChanged;
    if(!changed){ stats.heldUnchanged++; continue; }
    const row=Object.assign({ '_id':rec.id, 'Contact Key':rec.key, '_domain':domain }, rec.changes);
    if(rec.emailChanged) row['Email']=rec.emails.join(', ');
    if(rec.sourceChanged&&multi) row['Contact Source']=rec.sources.slice();
    if(row.Department==='') delete row.Department;
    for(const kk of Object.keys(row)){ if(kk.charAt(0)==='_') continue; if(!have.has(kk)) delete row[kk]; }
    if(Object.keys(row).filter(x=>x.charAt(0)!=='_'&&x!=='Contact Key').length){ out.push({ json:row }); stats.updated++; } else stats.heldUnchanged++;
  }
  if(covered) stats.coveredDomains.push(domain);
}
if(!out.length) return [{ json:{ _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
