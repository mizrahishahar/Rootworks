const inTable=new Set($('Read Final').all().map(i=>{const f=i.json.fields||i.json; return String(f.Domain||'').toLowerCase();}));
const comps=$('Collect Domains').first().json._companies||[];
const out=[];
for(const c of comps){ if(!inTable.has(c.Domain)){ out.push({json:{Domain:c.Domain,Company:c.Company,'Industry Groups':c['Industry Groups'],Employees:(c.Employees===''||c.Employees===undefined)?'':String(c.Employees),City:c.City,State:c.State,Country:c.Country}}); } }
return out;