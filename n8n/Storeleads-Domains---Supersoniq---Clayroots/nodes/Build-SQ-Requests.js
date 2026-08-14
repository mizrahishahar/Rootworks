const form=$('Contacts Launch').first().json;
const pd=$('Parse Domains').first().json;
const domains=pd._domains||[];
if(!domains.length){ throw new Error('No domains to enrich after parsing the CSV.'); }
const asArr=(v)=>{ if(v===undefined||v===null||v==='')return[]; if(Array.isArray(v))return v.map(x=>String(x).trim()).filter(Boolean); return String(v).split(',').map(s=>s.trim()).filter(Boolean); };
const DEFAULT_SEN=['C-Suite','Founder','Owner','President','VP','Head','Director'];
let seniority=asArr(form['Seniority levels (default net pre-ticked; untick to narrow)']);
if(!seniority.length) seniority=DEFAULT_SEN;
const CC={'United States':'US','Israel':'IL','United Kingdom':'GB','Canada':'CA','Australia':'AU','Germany':'DE','France':'FR','Netherlands':'NL'};
const countries=asArr(form['Contact location']).map(c=>CC[c]||'').filter(Boolean);
const depsRaw=asArr(form['Target departments (tick to narrow; ALL = every department)']);
const hasAll=depsRaw.some(d=>String(d).toLowerCase()==='all');
const deps=(!depsRaw.length||hasAll)?null:depsRaw;
const perCompany=parseInt(form['Contacts per company'],10)||5;
const out=[];
for(let i=0;i<domains.length;i+=1000){
  const chunk=domains.slice(i,i+1000);
  const filters={ seniority: seniority };
  if(countries.length) filters.contact_countries=countries;
  if(deps) filters.function=deps;
  out.push({ json: { companies: chunk.map(d=>({ domain: d })), filters: filters, per_company_limit: perCompany, tier: 'full' } });
}
return out;