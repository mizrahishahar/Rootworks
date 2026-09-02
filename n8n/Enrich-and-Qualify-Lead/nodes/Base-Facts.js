// Enrich and Qualify Lead, base step 3: the person facts from the People row and the company facts from its
// Companies row (the People lookups when the link is missing), and a bizdata object in the DiscoLike shape
// (name, domain, description, industry_groups, employees, revenue_range, address, social_urls, phones), so
// Build Prompt, the callers' Prospects writes and the Slack cards read the same keys whichever source filled them.
const pick = $('Pick Person').first().json || {};
const r = $input.first().json || {};
const body = (r.body !== undefined) ? r.body : r;
const crec = (body && Array.isArray(body.records) && body.records.length) ? body.records[0] : null;
const pf = pick.peopleFields || {}, cf = pick.companiesFields || {};
const P = pick.personFields || {}, C = (crec && crec.fields) || {};
const one = (v) => { if (v == null) return ''; if (Array.isArray(v)) return v.length ? String(v[0] == null ? '' : (v[0] && v[0].name ? v[0].name : v[0])).trim() : ''; if (typeof v === 'object') return String(v.name || v.value || '').trim(); return String(v).trim(); };
const all = (v) => { if (v == null) return []; if (!Array.isArray(v)) return one(v) ? [one(v)] : []; return v.map((x) => (x && typeof x === 'object') ? String(x.id || x.name || '') : String(x)).filter(Boolean); };
const person = (k) => (pf[k] ? P[pf[k]] : undefined);
const company = (k) => { const a = cf[k]; if (a && C[a] != null) return C[a]; return person(k); };
const list = (v) => String(v == null ? '' : v).split(/,\s*/).map((x) => x.trim()).filter(Boolean);

const personOut = {
  record_id: pick.personRecordId || '', name: one(person('Name')),
  title: one(person('Title')), seniority: one(person('Seniority')), department: one(person('Department')),
  linkedin_url: one(person('LinkedIn URL')), phone: one(person('Phone')),
  email: one(person('Email')), final_email: one(person('Final Email')), status: one(person('Status')),
  domain: one(person('Domain')), company: one(person('Company')), tag: one(person('Tag')),
  signals: all(person('Signals')), signal_at: one(person('Signal At')), campaigns: all(person('Campaigns'))
};
const companyOut = {
  record_id: crec ? crec.id : '', domain: one(company('Domain')), company: one(company('Company')),
  description: one(company('Description')), industry_groups: one(company('Industry Groups')),
  employees: one(company('Employees')), revenue_range: one(company('Revenue Range')),
  country: one(company('Country')), state: one(company('State')), city: one(company('City')),
  tag: one(company('Tag')), signals: all(company('Signals')), signal_at: one(company('Signal At')), campaigns: all(company('Campaigns')),
  social_urls: list(one(company('Social URLs'))), phones: list(one(company('Phones')))
};
const bizdata = {
  name: companyOut.company, domain: companyOut.domain, description: companyOut.description,
  industry_groups: companyOut.industry_groups, employees: companyOut.employees, revenue_range: companyOut.revenue_range,
  address: { country: companyOut.country, state: companyOut.state, city: companyOut.city },
  social_urls: companyOut.social_urls, phones: companyOut.phones,
  _source: 'client base' + (crec ? ' (Companies row ' + crec.id + ')' : ' (People lookups, no Companies row)')
};
return [{ json: {
  base_found: true, base_match: pick.base_match || '', base_source: "From the client's People table",
  base_people_record_id: pick.personRecordId || '', base_company_record_id: crec ? crec.id : '',
  base_people_table_id: pick.peopleTableId || '', base_companies_table_id: pick.companiesTableId || '',
  person: personOut, company: companyOut, bizdata
} }];
