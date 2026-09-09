// Apply DNC: drops people whose domain is on the client's DNC list (read once by the Rootflow and
// handed in), then fences the write set to exactly what the writer owns on People: Name,
// first_name, last_name, Title, Seniority, Department, Email, LinkedIn URL, Phone, Companies,
// Contact Key, Contact Source, Source ID. The _id carrier (a held row being filled) rides through.
const WRITE_FIELDS=['Name','first_name','last_name','Title','Seniority','Department','Email','LinkedIn URL','Phone','Companies','Contact Key','Contact Source','Source ID'];
const inp=$('Writer Trigger').first().json||{};
const have=new Set(inp.peopleFields||[]);
const allow=new Set(WRITE_FIELDS.filter(k=>have.has(k)));
const dnc=new Set((inp.dncDomains||[]).map(d=>String(d).toLowerCase()));
const domainByKey={};
try{ for(const it of $('Merge People').all()){ const j=it.json||{}; const k=String(j['Contact Key']||'').toLowerCase(); if(k&&j._domain) domainByKey[k]=String(j._domain).toLowerCase(); } }catch(e){}
const out=[];
for(const i of $('Clean Fields').all()){
  const j=i.json||{};
  if(j._empty) continue;
  const key=String(j['Contact Key']||'').toLowerCase().trim(); if(!key) continue;
  const d=String(j._domain||domainByKey[key]||'').toLowerCase().trim();
  if(dnc.size&&d&&dnc.has(d)) continue;
  const row={}; for(const k of Object.keys(j)){ if(allow.has(k)) row[k]=j[k]; }
  if(j._id) row._id=j._id;
  out.push({ json:row });
}
if(!out.length) return [{ json:{ _empty:true } }];
return out;
