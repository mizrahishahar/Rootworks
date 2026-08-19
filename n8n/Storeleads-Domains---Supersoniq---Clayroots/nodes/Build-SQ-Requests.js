const form=$('Contacts Launch').first().json;
const pd=$('Parse Domains').first().json;
const domains=pd._domains||[];
const cmap=pd._cmap||{};
if(!domains.length){ throw new Error('No domains to enrich after parsing the CSV.'); }
const asArr=(v)=>{ if(v===undefined||v===null||v==='')return[]; if(Array.isArray(v))return v.map(x=>String(x).trim()).filter(Boolean); return String(v).split(',').map(s=>s.trim()).filter(Boolean); };
const CC={'United States':'US','Israel':'IL','United Kingdom':'GB','Canada':'CA','Australia':'AU','Germany':'DE','France':'FR','Netherlands':'NL'};
const countries=asArr(form['Contact location']).map(c=>CC[c]||'').filter(Boolean);

// Decision-maker tier, fixed - not a form choice. 'Unclassified' is included: an
// unreliable classifier saying 'we don't know' is not the same as 'not a decision-maker'.
// Department is never sent - same reasoning, we don't trust the classification enough
// to let it silently exclude someone.
const STANDARD_SEN=['Manager','Senior Manager','Director','Head','VP','EVP / SVP','President','C-Suite','Owner','Founder','Partner','Board / Chair','Unclassified'];
// At small companies a bare 'Senior' title is often the de facto decision-maker - company
// structure is flat enough that title doesn't mean what it means at a 500-person company.
const SMALL_SEN=STANDARD_SEN.concat(['Senior']);
const SMALL_MAX_EMPLOYEES=10;
// Circuit-breaker, not a target - real per-company yield varies a lot, this just stops
// one outlier account from ballooning a single run's spend.
const PER_COMPANY_LIMIT=12;

const small=[], standard=[];
for(const d of domains){
  const emp=Number((cmap[d]||{}).Employees);
  (Number.isFinite(emp)&&emp>0&&emp<=SMALL_MAX_EMPLOYEES ? small : standard).push(d);
}

const chunk=(arr,n)=>{ const out=[]; for(let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n)); return out; };
const buildItems=(list,seniority)=>{
  const filters={ seniority };
  if(countries.length) filters.contact_countries=countries;
  return chunk(list,1000).map(c=>({ json: { companies: c.map(d=>({ domain: d })), filters: filters, per_company_limit: PER_COMPANY_LIMIT, tier: 'full' } }));
};

return [...buildItems(standard,STANDARD_SEN), ...buildItems(small,SMALL_SEN)];