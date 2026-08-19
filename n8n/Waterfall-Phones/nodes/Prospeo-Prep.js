// Tier 4: Prospeo enrich-person with enrich_mobile. 10 credits per mobile FOUND, free on miss.
// Best identifier wins: email, else name + company website, else LinkedIn URL.
const j0 = $input.first().json;
const j = Object.assign({}, j0); delete j.callBody;
if (j._invalid) return [{ json: Object.assign({}, j, { _call: 0 }) }];
const acc = j.acc, p = j.person;
if (acc.phone) return [{ json: Object.assign({}, j, { _call: 0 }) }];
let data = null;
if (p.email) data = { email: p.email };
else if (p.first_name && p.last_name && p.domain) data = { first_name: p.first_name, last_name: p.last_name, company_website: p.domain };
else if (p.full_name && p.domain) data = { full_name: p.full_name, company_website: p.domain };
else if (p.linkedin) data = { linkedin_url: p.linkedin };
if (!data) { acc.skipped.push('prospeo: no usable identifier'); return [{ json: Object.assign({}, j, { _call: 0 }) }]; }
acc.tried.push('prospeo');
return [{ json: Object.assign({}, j, { _call: 1, callBody: { data, enrich_mobile: true } }) }];
