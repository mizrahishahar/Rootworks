const pd = $('Parse Domains').first().json;
const domains = pd._domains || [];
const form = $('Waterfall Upload').first().json;

// Local domain -> Employees lookup. Parse Domains in this workflow only tracks unique
// domains, not company data (unlike Storeleads' Parse Domains) - so we build it here from
// the raw CSV, same extraction pattern Format ContaGen/Format Supersoniq already use.
const cmap = {};
for (const r of $('Read CSV').all().map(i => i.json)) {
  const d = String(r.Domain || r.domain || r.company_domain || '').trim().toLowerCase();
  if (d && cmap[d] === undefined) cmap[d] = r.Employees;
}

const asArr = (v, def) => { if (v===undefined||v===null||v==='') return def; if (Array.isArray(v)) return v.map(x=>String(x).trim()).filter(Boolean); return String(v).split(',').map(s=>s.trim()).filter(Boolean); };
const CMAP={'United States':'US','Israel':'IL','United Kingdom':'GB','Canada':'CA','Australia':'AU','Germany':'DE','France':'FR','Netherlands':'NL'};
const locNames = asArr(form['Contact location'], ['United States']);
const loc = locNames.map(x=>CMAP[x]||x);

// Decision-maker tier, fixed - not a form choice. 'Unclassified' is included: an
// unreliable classifier saying 'we don't know' is not the same as 'not a decision-maker'.
// Department is never sent - same reasoning, we don't trust the classification enough
// to let it silently exclude someone.
const STANDARD_SEN=['Manager','Senior Manager','Director','Head','VP','EVP / SVP','President','C-Suite','Owner','Founder','Partner','Board / Chair','Unclassified'];
// At small companies a bare 'Senior' title is often the de facto decision-maker - company
// structure is flat enough that title doesn't mean what it means at a 500-person company.
const SMALL_SEN=STANDARD_SEN.concat(['Senior']);
const SMALL_MAX_EMPLOYEES=10;
// Circuit-breaker, not a target - match_companies-style real yield varies a lot by
// company, this just stops one outlier account from ballooning a single run's spend.
const PER_COMPANY_LIMIT=12;

const small=[], standard=[];
for(const d of domains){
  const emp=Number(cmap[d]);
  (Number.isFinite(emp)&&emp>0&&emp<=SMALL_MAX_EMPLOYEES ? small : standard).push(d);
}

const chunk=(arr,n)=>{ const out=[]; for(let i=0;i<arr.length;i+=n) out.push(arr.slice(i,i+n)); return out; };
const buildItems=(list,seniority)=>chunk(list,1000).map(c=>({ json: { companies: c.map(d=>({domain:d})), filters: { seniority, contact_countries: loc }, per_company_limit: PER_COMPANY_LIMIT, tier: 'full' } }));

const out=[...buildItems(standard,STANDARD_SEN), ...buildItems(small,SMALL_SEN)];
return out;