// One batch of domains -> Supersoniq enrich request bodies. Mirrors the seniority
// doctrine of the old parent-level Build SQ Requests (2026-08); only the data source
// changed: everything arrives through Batch Input instead of $('Parse Domains').
const inp = $('Batch Input').first().json;
const domains = Array.isArray(inp.domains) ? inp.domains : [];
if (!domains.length) { throw new Error('SQ Contacts Batch received an empty domain batch. The parent must never send one.'); }
const cmap = inp.cmapSlice || {};
const countries = (Array.isArray(inp.countries) ? inp.countries : []).map(c => String(c).trim()).filter(Boolean);

// Decision-maker tier, fixed - not a form choice. 'Unclassified' is included: an
// unreliable classifier saying 'we don't know' is not the same as 'not a decision-maker'.
// Department is never sent - same reasoning, we don't trust the classification enough
// to let it silently exclude someone.
const STANDARD_SEN = ['Manager', 'Senior Manager', 'Director', 'Head', 'VP', 'EVP / SVP', 'President', 'C-Suite', 'Owner', 'Founder', 'Partner', 'Board / Chair', 'Unclassified'];
// At small companies a bare 'Senior' title is often the de facto decision-maker - company
// structure is flat enough that title doesn't mean what it means at a 500-person company.
const SMALL_SEN = STANDARD_SEN.concat(['Senior']);
const SMALL_MAX_EMPLOYEES = 10;
// Circuit-breaker, not a target - real per-company yield varies a lot, this just stops
// one outlier account from ballooning a single run's spend.
const PER_COMPANY_LIMIT = 12;

const small = [], standard = [];
for (const d of domains) {
  const emp = Number((cmap[d] || {}).Employees);
  (Number.isFinite(emp) && emp > 0 && emp <= SMALL_MAX_EMPLOYEES ? small : standard).push(d);
}

const chunk = (arr, n) => { const out = []; for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n)); return out; };
const buildItems = (list, seniority) => {
  const filters = { seniority };
  if (countries.length) filters.contact_countries = countries;
  return chunk(list, 1000).map(c => ({ json: { companies: c.map(d => ({ domain: d })), filters: filters, per_company_limit: PER_COMPANY_LIMIT, tier: 'full' } }));
};

return [...buildItems(standard, STANDARD_SEN), ...buildItems(small, SMALL_SEN)];
