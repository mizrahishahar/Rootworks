// Merge People: every provider's answer, merged into the register's People shape (rebuilt
// 2026-09-08 as the Enrich Contacts Rootflow). The rules, ruled 2026-09-08:
//   Keys. Contact Key (cleaned first + last + domain) first; the LinkedIn slug second. A person
//     already held at this domain (either key) is the same person: the held row is UPDATED, blanks
//     filled, nothing overwritten. Two providers naming the same person merge the same way.
//   Priority. Blitz, GetLeads, QuickEnrich, Supersoniq: first writer wins on every filled cell
//     (Title, Seniority, Department, Phone, Source ID); nothing ever updates a held Title.
//   Email. Comma-separated, priority order, deduped case-insensitively; the email Rootflow reads a
//     list of any length. A held Email gets new candidates appended, never replaced.
//   LinkedIn fence. A URL is written only when its slug contains the cleaned first or last name
//     (the linkedin_name_match rule, applied in the machine); a URL that fails is left blank and
//     the next provider gets its try. The formula stays on the table as the visible check.
//   Contact Source. Every provider that returned the person, even one that filled nothing: an
//     array when the field is a multi-select; the first (highest priority) source only when the
//     base still carries the single select, and the run log says so.
//   Seniority and Department come from the provider when it has them, else from the title.
// The vocabularies come from the field register, inlined by the push as REGISTER at the @@register
// line; a map target the register does not carry is a build defect and fails here.
// @@register
const inp=$('Batch Input').first().json;
const plan=$('Plan Batch').first().json;
const have=new Set(inp.peopleFields||[]);
const multi=inp.contactSourceMulti===true;
const PRIORITY=['Blitz','GetLeads','QuickEnrich','Supersoniq'];
const NODE={ Blitz:'Run Blitz', GetLeads:'Run GetLeads', QuickEnrich:'Run QuickEnrich', Supersoniq:'Run Supersoniq' };
const prov={};
for(const p of PRIORITY){ try{ const j=$(NODE[p]).first().json||{}; prov[p]=(j&&j.people&&typeof j.people==='object')?j.people:{}; }catch(e){ prov[p]={}; } }
const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};
const PEOPLE=REGISTER.tables.find(t=>t.name==='People');
const choices=(n)=>new Set(PEOPLE.fields.find(f=>f.name===n).options.choices.map(c=>c.name));
const SENIORITY=choices('Seniority'), DEPARTMENT=choices('Department');
// Provider seniority words -> the People Seniority select. GetLeads and Blitz speak six levels
// (C-Team, VP, Director, Manager, Staff, Other); Supersoniq speaks the register's own words.
const SEN={ 'executive':'Executive', 'c-suite':'C-Suite', 'c_suite':'C-Suite', 'csuite':'C-Suite', 'c-team':'C-Suite', 'cxo':'C-Suite', 'founder':'Founder', 'owner':'Owner', 'president':'President', 'vp':'VP', 'vice president':'VP', 'head':'Head', 'director':'Director', 'manager':'Manager', 'senior manager':'Manager', 'senior':'Senior', 'senior_ic':'Senior', 'staff':'Senior', 'mid_level':'Senior', 'partner':'Partner', 'evp / svp':'EVP / SVP', 'evp':'EVP / SVP', 'svp':'EVP / SVP', 'board / chair':'Board / Chair', 'board':'Board / Chair', 'chair':'Board / Chair', 'unclassified':'Unclassified', 'other':'Unclassified' };
// The title refines a coarse level (a "C-Team" who is the founder is a Founder) and stands in
// where a provider sends no level at all (Blitz, QuickEnrich). Order matters: the first match wins.
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
const stats={ returned:0, built:0, updated:0, heldUnchanged:0, dupes:0, noKey:0, fenced:0, emailsAppended:0, singleSelectSource:!multi, perProvider:{} };
for(const p of PRIORITY) stats.perProvider[p]={ returned:0, newRows:0, mergedInto:0 };
const out=[];
for(const c of plan.plan){
  const heldByKey={}, heldBySlug={};
  for(const h of (c.heldRows||[])){
    const rec={ id:h.id, key:String(h.key||'').toLowerCase(), held:true, fields:{ Title:h.title||'', Seniority:h.seniority||'', Department:h.department||'', 'LinkedIn URL':h.linkedin||'', Phone:h.phone||'', 'Source ID':h.sourceId||'' }, emails:splitEmails(h.email), sources:(Array.isArray(h.sources)?h.sources:(h.sources?[h.sources]:[])).slice(), changes:{}, emailChanged:false, sourceChanged:false };
    if(rec.key) heldByKey[rec.key]=rec;
    const s=slugOf(h.linkedin); if(s) heldBySlug[s]=rec;
  }
  const newByKey={}, newBySlug={}; const rows=[];
  for(const p of PRIORITY){
    for(const person of (prov[p][c.domain]||[])){
      stats.returned++; stats.perProvider[p].returned++;
      const full=String(person.name||'').trim();
      const first=cleanFirst(full), last=cleanLast(full);
      if(!first){ stats.noKey++; continue; }
      const key=(first.toLowerCase()+last.toLowerCase()+c.domain).trim();
      const rawLi=String(person.linkedin||'').trim(); const slug=slugOf(rawLi);
      const li=(rawLi&&fenceOk(slug,first,last))?rawLi:''; if(rawLi&&!li) stats.fenced++;
      const email=String(person.email||'').trim().toLowerCase();
      const sen=mapSen(person.seniority, person.title); const dep=mapDep(person.department, person.title);
      const incoming={ Title:String(person.title||'').trim(), Seniority:sen, Department:dep, 'LinkedIn URL':li, Phone:String(person.phone||'').trim(), 'Source ID':String(person.sourceId||'').trim() };
      let target=newByKey[key]||(li&&newBySlug[slug])||heldByKey[key]||(li&&heldBySlug[slug])||null;
      if(!target){
        target={ id:'', key:key, held:false, fields:incoming, emails:email?[email]:[], sources:[p], name:full, changes:null };
        newByKey[key]=target; if(li) newBySlug[slug]=target; rows.push(target);
        stats.built++; stats.perProvider[p].newRows++;
        continue;
      }
      stats.perProvider[p].mergedInto++;
      if(!target.held) stats.dupes++;
      for(const k of Object.keys(incoming)){
        const cur=String(target.fields[k]||''); const nv=incoming[k];
        const blank=!cur||(k==='Seniority'&&cur==='Unclassified');
        if(blank&&nv){ target.fields[k]=nv; if(target.held) target.changes[k]=nv; }
      }
      if(email&&target.emails.indexOf(email)<0){ target.emails.push(email); if(target.held){ target.emailChanged=true; stats.emailsAppended++; } }
      if(target.sources.indexOf(p)<0){ target.sources.push(p); if(target.held) target.sourceChanged=true; }
    }
  }
  for(const r of rows){
    const row={ 'Name':r.name, 'Title':r.fields.Title, 'Seniority':r.fields.Seniority, 'Department':r.fields.Department, 'Email':r.emails.join(', '), 'LinkedIn URL':r.fields['LinkedIn URL'], 'Phone':r.fields.Phone, 'Companies':[c.recordId], 'Contact Key':r.key, 'Contact Source':(multi?r.sources.slice():r.sources[0]), 'Source ID':r.fields['Source ID'], '_domain':c.domain };
    if(!row.Department) delete row.Department;
    for(const k of Object.keys(row)){ if(k.charAt(0)==='_') continue; if(!have.has(k)) delete row[k]; }
    out.push({ json:row });
  }
  for(const k of Object.keys(heldByKey)){
    const r=heldByKey[k];
    const changed=Object.keys(r.changes).length||r.emailChanged||r.sourceChanged;
    if(!changed){ stats.heldUnchanged++; continue; }
    const row=Object.assign({ '_id':r.id, 'Contact Key':r.key, '_domain':c.domain }, r.changes);
    if(r.emailChanged) row['Email']=r.emails.join(', ');
    if(r.sourceChanged&&multi) row['Contact Source']=r.sources.slice();
    if(row.Department==='') delete row.Department;
    for(const kk of Object.keys(row)){ if(kk.charAt(0)==='_') continue; if(!have.has(kk)) delete row[kk]; }
    if(Object.keys(row).filter(x=>x.charAt(0)!=='_'&&x!=='Contact Key').length){ out.push({ json:row }); stats.updated++; } else stats.heldUnchanged++;
  }
}
if(!out.length) return [{ json:{ _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
