// Domains that went to Supersoniq and came back with no contacts -> overflow rows.
// Rewritten 2026-08-24 for the batch loop: submitted domains come from Parse Domains
// (every batch drew from that list) and contact-bearing domains from the loop tally,
// instead of the retired parent-level Build SQ Requests / SQ Guard nodes.
const sd = $getWorkflowStaticData('global');
sd.overflowUrl = '';
sd.overflowError = '';
sd.overflowFolderId = '';
sd.overflowCount = 0;

const pd = $('Parse Domains').first().json;
const submitted = pd._domains || [];
const cmap = pd._cmap || {};
const withContacts = (sd.cbState && sd.cbState.withContacts) || {};

const seen = new Set();
const out = [];
for (const d of submitted) {
  if (withContacts[d] || seen.has(d)) continue;
  seen.add(d);
  const c = cmap[d] || {};
  out.push({ json: {
    Domain: d,
    Company: c.company_clean || c.Company || '',
    'Industry Groups': c['Industry Groups'] || '',
    'Business Model': c['Business Model'] || '',
    Employees: c.Employees || '',
    City: c.City || '',
    State: c.State || '',
    Country: c.Country || '',
    Plan: c.Plan || '',
    'Revenue Est Monthly': c['Revenue Est Monthly'] || '',
    'Store Age Years': c['Store Age Years'] || '',
    'Product Count': c['Product Count'] || '',
    'MX Provider': c['MX Provider'] || '',
    'Trustpilot Rating': c['Trustpilot Rating'] || '',
    'Trustpilot Reviews': c['Trustpilot Reviews'] || '',
    'Social Followers': c['Social Followers'] || '',
    'Growth 90d': c['Growth 90d'] || ''
  } });
}

sd.overflowCount = out.length;
return out;
