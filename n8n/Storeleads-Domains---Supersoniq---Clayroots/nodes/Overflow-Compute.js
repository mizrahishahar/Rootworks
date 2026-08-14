const sd = $getWorkflowStaticData('global');
sd.overflowUrl = '';
sd.overflowError = '';
sd.overflowFolderId = '';
sd.overflowCount = 0;

const submitted = [];
for (const it of $('Build SQ Requests').all()) {
  const cs = Array.isArray(it.json.companies) ? it.json.companies : [];
  for (const c of cs) {
    const d = String((c && c.domain) || '').trim().toLowerCase();
    if (d) submitted.push(d);
  }
}

const withContacts = new Set();
for (const it of $('SQ Guard').all()) {
  const rs = Array.isArray(it.json.results) ? it.json.results : [];
  for (const r of rs) {
    const cts = (r && Array.isArray(r.contacts)) ? r.contacts : [];
    for (const ct of cts) {
      const d = String((ct && ct.company_domain) || '').trim().toLowerCase();
      if (d) withContacts.add(d);
    }
  }
}

let cmap = {};
try { cmap = $('Parse Domains').first().json._cmap || {}; } catch (e) { cmap = {}; }

const seen = new Set();
const out = [];
for (const d of submitted) {
  if (withContacts.has(d) || seen.has(d)) continue;
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