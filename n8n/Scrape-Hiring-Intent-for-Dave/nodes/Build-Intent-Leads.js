const resp = ($input.first() && $input.first().json) ? $input.first().json : {};
let contacts = [];
if (Array.isArray(resp.results)) contacts = resp.results;
else if (Array.isArray(resp.contacts)) contacts = resp.contacts;
else if (Array.isArray(resp.data)) contacts = resp.data;
else if (Array.isArray(resp)) contacts = resp;
const companies = {};
for (const i of $('Filter & Qualify Jobs').all()) { companies[i.json.domain] = i.json; }
const TARGET = 'https://api.altahq.com/audience/webhook/3c2ba4e8-4193-490b-bc23-5ffeed0cc819/pull-in-prospect';
const leads = [];
for (const c of contacts) {
  const dom = String(c.company_domain || c.domain || '').toLowerCase();
  const co = companies[dom] || {};
  const li = c.linkedin_url || '';
  if (!li) continue;
  const role = co.job_title || 'an infrastructure role';
  const posted = co.posted_at ? ' (posted ' + co.posted_at + ')' : '';
  leads.push({ first_name: c.first_name || '', last_name: c.last_name || '', name: c.full_name || ((c.first_name || '') + ' ' + (c.last_name || '')).trim(), linkedin_url: li, company: c.company_name || co.company || '', domain: dom, event_type: 'became_hiring', target_campaign: TARGET, signal_detail: 'Hiring ' + role + posted + '. Decision maker (' + (c.job_title || c.seniority || '') + ') sourced via Apify jobs scrape + Supersoniq. Job: ' + (co.job_link || '') });
}
return [{ json: { leads, count: leads.length } }];