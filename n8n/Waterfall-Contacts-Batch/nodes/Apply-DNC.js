// Apply DNC: one pass for both modes (the writer's ContaGen and Supersoniq rows, the ark pass's
// AI-Ark rows; Any People? feeds Clean Fields from either builder). Drops people whose domain sits
// on the client's DNC table (every page of it, read once by Get DNC Domains); the domain is the
// _domain carrier the builders set, backed by a Contact Key -> domain map read straight from the
// builders in case the helper dropped the carrier. Then fences the write set to exactly what this
// machine writes on People (ruled 2026-09-02): Name, Title, Seniority, Department, Email,
// LinkedIn URL, Phone, Companies, Contact Key, Contact Source, Source ID, plus first_name and
// last_name, the split Clean Fields made from Name (register text fields the linkedin_name_match
// formula reads). Domain, Company and Tag are lookups through the Companies link and are never
// written; every other key, carriers included, is stripped, and a key the table does not carry is
// stripped too, so the writer never meets an unknown field. Zero survivors still emit one {_empty}
// placeholder so the gate reaches the close. Batch Summary counts the drop as rows in minus rows out.
const WRITE_FIELDS=['Name','first_name','last_name','Title','Seniority','Department','Email','LinkedIn URL','Phone','Companies','Contact Key','Contact Source','Source ID'];
const have=new Set(($('Batch Input').first().json.peopleFields)||[]);
const allow=new Set(WRITE_FIELDS.filter(k=>have.has(k)));
const dnc=new Set();
try{ for(const it of $('Get DNC Domains').all()){ const j=it.json||{}; const f=j.fields||{}; const d=String(f.Domain||f.domain||'').toLowerCase().trim(); if(d) dnc.add(d); } }catch(e){}
const domainByKey={};
const learn=(n)=>{ try{ for(const it of $(n).all()){ const j=it.json||{}; const k=String(j['Contact Key']||'').toLowerCase(); if(k&&j._domain) domainByKey[k]=String(j._domain).toLowerCase(); } }catch(e){} };
learn('Build People'); learn('Build Ark People');
const out=[];
for(const i of $('Clean Fields').all()){
  const j=i.json||{};
  if(j._empty) continue;
  const key=String(j['Contact Key']||'').toLowerCase().trim();
  if(!key) continue;
  const d=String(j._domain||domainByKey[key]||'').toLowerCase().trim();
  if(dnc.size&&d&&dnc.has(d)) continue;
  const row={};
  for(const k of Object.keys(j)){ if(allow.has(k)) row[k]=j[k]; }
  out.push({ json: row });
}
if(!out.length) return [{ json: { _empty:true } }];
return out;
