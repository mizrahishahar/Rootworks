// Build Ark People: the AI-Ark people into the register's People shape, capped absolutely at
// the gap the run's recount showed. Anyone the base already holds at the domain (Contact Key or
// LinkedIn URL, per the recount) is never written. Same shape as Build People: no Domain, Company
// or Tag (lookups through the Companies link, ruled 2026-09-02), the domain on the _domain carrier
// for the DNC pass and the coverage count, stripped before the write. The Seniority and Department
// vocabularies come from the field register, inlined by the push as REGISTER at the @@register line.
// @@register
const inp=$('Batch Input').first().json;
const plan=$('Plan Batch').first().json;
const have=new Set(inp.peopleFields||[]);
let ark={ people:{} }; try{ ark=$('Parse Ark').first().json||ark; }catch(e){}
let held={}; let gaps={};
try{ const ap=$('Ark Plan').first().json||{}; held=ap.held||{}; for(const r of (ap.arkRequests||[])) gaps[r.domain]=r.gap; }catch(e){}
const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};
const PEOPLE=REGISTER.tables.find(t=>t.name==='People');
const choices=(n)=>new Set(PEOPLE.fields.find(f=>f.name===n).options.choices.map(c=>c.name));
const SENIORITY=choices('Seniority'), DEPARTMENT=choices('Department');
const SEN={ 'executive':'Executive', 'c-suite':'C-Suite', 'c_suite':'C-Suite', 'csuite':'C-Suite', 'cxo':'C-Suite', 'founder':'Founder', 'owner':'Owner', 'president':'President', 'vp':'VP', 'vice president':'VP', 'head':'Head', 'director':'Director', 'manager':'Manager', 'senior manager':'Manager', 'senior':'Senior', 'senior_ic':'Senior', 'partner':'Partner', 'evp / svp':'EVP / SVP', 'evp':'EVP / SVP', 'svp':'EVP / SVP', 'board / chair':'Board / Chair', 'board':'Board / Chair', 'chair':'Board / Chair', 'unclassified':'Unclassified' };
const DEP={ 'executive':'Executive', 'engineering':'Engineering', 'software_development':'Engineering', 'technology':'Technology', 'it':'Technology', 'information_technology':'Technology', 'information technology':'Technology', 'r&d':'R&D', 'research & development':'R&D', 'research_and_development':'R&D', 'research':'R&D', 'product':'Product', 'product_management':'Product', 'product management':'Product', 'data':'Data', 'data_science':'Data', 'data science':'Data', 'analytics':'Data', 'security':'Security', 'information_security':'Security', 'design':'Design', 'operations':'Operations', 'sales':'Sales', 'business_development':'Sales', 'marketing':'Marketing', 'demand_generation':'Marketing', 'finance':'Finance', 'accounting':'Finance', 'human resources':'Human Resources', 'human_resources':'Human Resources', 'hr':'Human Resources', 'recruiting_talent_acquisition':'Human Resources', 'customer success':'Customer Success', 'customer_success':'Customer Success', 'customer service':'Customer Success', 'customer_service':'Customer Success', 'support':'Customer Success', 'project management':'Project Management', 'project_management':'Project Management', 'strategy':'Strategy', 'legal':'Legal', 'supply chain':'Supply Chain', 'supply_chain':'Supply Chain', 'logistics':'Supply Chain', 'procurement':'Supply Chain', 'communications':'Communications', 'public relations':'Communications', 'public_relations':'Communications', 'community':'Community & Social', 'compliance':'Compliance & GRC', 'grc':'Compliance & GRC', 'risk':'Compliance & GRC' };
// A map target the register does not carry is a build defect: fail here, never mint a choice.
for(const v of Object.values(SEN)){ if(!SENIORITY.has(v)) throw new Error('Build Ark People: Seniority "'+v+'" is not on the register'); }
for(const v of Object.values(DEP)){ if(!DEPARTMENT.has(v)) throw new Error('Build Ark People: Department "'+v+'" is not on the register'); }
const mapSen=(v)=>SEN[String(v||'').trim().toLowerCase()]||'Unclassified';
const mapDep=(v)=>{ for(const part of String(v||'').split(/[,;|]/)){ const m=DEP[part.trim().toLowerCase()]; if(m) return m; } return ''; };
const seenKey=new Set(); const seenLi=new Set();
const stats={ built:0, heldSkipped:0, dupes:0, noKey:0, overCap:0 };
const out=[];
for(const c of plan.plan){
  const list=(ark.people||{})[c.domain]||[]; if(!list.length) continue;
  const h=held[c.domain]||{ count:0, keys:[], linkedin:[] };
  const heldKeys=new Set((h.keys||[]).map(k=>String(k).toLowerCase())); const heldLi=new Set((h.linkedin||[]).map(l=>String(l).toLowerCase()));
  const gap=Number(gaps[c.domain])||0; let written=0;
  for(const p of list){
    if(written>=gap){ stats.overCap++; continue; }
    const full=String(p.name||'').trim();
    const first=cleanFirst(full), last=cleanLast(full);
    const key=(first.toLowerCase()+last.toLowerCase()+c.domain).trim();
    const li=String(p.linkedin||'').trim(); const lil=li.toLowerCase();
    if(!key||!first){ stats.noKey++; continue; }
    if(heldKeys.has(key)||(lil&&heldLi.has(lil))){ stats.heldSkipped++; continue; }
    if(seenKey.has(key)||(lil&&seenLi.has(lil))){ stats.dupes++; continue; }
    seenKey.add(key); if(lil) seenLi.add(lil);
    const row={
      'Name': full,
      'Title': String(p.title||''),
      'Seniority': mapSen(p.seniority),
      'Department': mapDep(p.department),
      'Email': String(p.email||'').trim(),
      'LinkedIn URL': li,
      'Phone': String(p.phone||''),
      'Companies': [c.recordId],
      'Contact Key': key,
      'Contact Source': 'AI-Ark',
      'Source ID': String(p.sourceId||''),
      '_domain': c.domain
    };
    if(!row['Department']) delete row['Department'];
    for(const k of Object.keys(row)){ if(k.charAt(0)==='_') continue; if(!have.has(k)) delete row[k]; }
    out.push({ json: row }); written++; stats.built++;
  }
}
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
