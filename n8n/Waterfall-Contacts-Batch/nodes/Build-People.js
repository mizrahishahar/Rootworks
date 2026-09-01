// Build People: every person ContaGen and Supersoniq returned, in that order, into the
// register's People shape. The fill-blanks rule: a person the base already holds (Contact Key
// or LinkedIn URL, tier zero) is never written at all, and a later tier never overwrites an
// earlier one. The cap is per source here (each tier already returned at most the band cap),
// absolute only at AI-Ark. Only keys the People table carries are emitted (an extra key 422s
// the upsert). Names go out raw; Clean Fields splits them into first_name / last_name next.
const inp=$('Batch Input').first().json;
const plan=$('Plan Batch').first().json;
const have=new Set(inp.peopleFields||[]);
const tiers=[];
try{ tiers.push($('Parse ContaGen').first().json.people||{}); }catch(e){ tiers.push({}); }
try{ tiers.push($('Parse Supersoniq').first().json.people||{}); }catch(e){ tiers.push({}); }
const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};
// Source enums -> the People Seniority select (14 values). Unknown -> Unclassified.
const SEN={ 'executive':'Executive', 'c-suite':'C-Suite', 'c_suite':'C-Suite', 'csuite':'C-Suite', 'cxo':'C-Suite', 'founder':'Founder', 'owner':'Owner', 'president':'President', 'vp':'VP', 'vice president':'VP', 'head':'Head', 'director':'Director', 'manager':'Manager', 'senior manager':'Manager', 'senior':'Senior', 'senior_ic':'Senior', 'partner':'Partner', 'evp / svp':'EVP / SVP', 'evp':'EVP / SVP', 'svp':'EVP / SVP', 'board / chair':'Board / Chair', 'board':'Board / Chair', 'chair':'Board / Chair', 'unclassified':'Unclassified' };
const mapSen=(v)=>SEN[String(v||'').trim().toLowerCase()]||'Unclassified';
// Source departments -> the People Department select (21 values). Unknown -> the key is omitted.
const DEP={ 'executive':'Executive', 'engineering':'Engineering', 'technology':'Technology', 'it':'Technology', 'information technology':'Technology', 'r&d':'R&D', 'research & development':'R&D', 'research and development':'R&D', 'research':'R&D', 'product':'Product', 'product management':'Product', 'data':'Data', 'data science':'Data', 'analytics':'Data', 'security':'Security', 'information security':'Security', 'design':'Design', 'operations':'Operations', 'sales':'Sales', 'sales - marketing':'Sales', 'business development':'Sales', 'marketing':'Marketing', 'finance':'Finance', 'accounting':'Finance', 'human resources':'Human Resources', 'hr':'Human Resources', 'people':'Human Resources', 'customer success':'Customer Success', 'customer service':'Customer Success', 'support':'Customer Success', 'project management':'Project Management', 'strategy':'Strategy', 'legal':'Legal', 'supply chain':'Supply Chain', 'logistics':'Supply Chain', 'procurement':'Supply Chain', 'communications':'Communications', 'public relations':'Communications', 'community':'Community & Social', 'community & social':'Community & Social', 'social':'Community & Social', 'compliance':'Compliance & GRC', 'compliance & grc':'Compliance & GRC', 'grc':'Compliance & GRC', 'risk':'Compliance & GRC' };
const mapDep=(v)=>{ for(const part of String(v||'').split(/[,;|]/)){ const m=DEP[part.trim().toLowerCase()]; if(m) return m; } return ''; };
const seenKey=new Set(); const seenLi=new Set();
const stats={ built:0, heldSkipped:0, dupes:0, noKey:0 };
const out=[];
for(const c of plan.plan){
  const heldKeys=new Set(c.heldKeys||[]); const heldLi=new Set((c.heldLinkedin||[]).map(l=>l.toLowerCase()));
  for(const list of tiers){
    for(const p of (list[c.domain]||[])){
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
        'Domain': c.domain,
        'Company': c.company,
        'Contact Key': key,
        'Contact Source': p.source,
        'Source ID': String(p.sourceId||''),
        'Tag': c.tag,
        'Companies': [c.recordId]
      };
      if(!row['Department']) delete row['Department'];
      for(const k of Object.keys(row)){ if(!have.has(k)) delete row[k]; }
      out.push({ json: row }); stats.built++;
    }
  }
}
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
