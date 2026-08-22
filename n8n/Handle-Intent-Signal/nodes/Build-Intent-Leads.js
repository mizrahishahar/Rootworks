const cfg=$('Parse Config').first().json;
const companies = {};
for (const i of $('Filter & Qualify Jobs').all()) { companies[i.json.domain] = i.json; }
const TARGET = cfg.campaign_url;
const nowIso = new Date().toISOString();
function pushContact(out, c) {
  const dom = String(c.company_domain || c.domain || '').toLowerCase();
  const co = companies[dom] || {};
  const li = c.linkedin_url || '';
  if (!li) return;
  const role = co.job_title || 'an infrastructure role';
  const posted = co.posted_at ? ' (posted ' + co.posted_at + ')' : '';
  out.push({ json: {
    'Name': c.full_name || ((c.first_name || '') + ' ' + (c.last_name || '')).trim(),
    'first_name': c.first_name || '',
    'last_name': c.last_name || '',
    'LinkedIn URL': li,
    'Domain': dom,
    'Company': String(c.company_name || co.company || '').trim(),
    'Email': c.email || '',
    'Event Type': cfg.event_type,
    'Target Campaign': TARGET,
    'Signal Detail': 'Hiring ' + role + posted + '. Decision maker (' + (c.job_title || c.seniority || '') + ') via Apify jobs scrape + Supersoniq. Job: ' + (co.job_link || ''),
    'Intent Status': 'NEW',
    'detected_at': nowIso
  }});
}
const out = [];
for (const it of $('Get Decision Makers').all()) {
  const resp = it.json || {};
  const comps = Array.isArray(resp.results) ? resp.results : [];
  for (const comp of comps) {
    if (Array.isArray(comp.contacts)) { for (const c of comp.contacts) pushContact(out, c); }
    else pushContact(out, comp);
  }
}
return out;