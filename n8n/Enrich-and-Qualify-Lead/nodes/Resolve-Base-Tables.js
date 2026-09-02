// Enrich and Qualify Lead, base step 1: the client's People and Companies tables, resolved by name from the
// base meta (the Find Tables model of Waterfall Contacts), and the one People search that covers the whole
// resolve order at once. Nothing here throws: an intake must never crash on a base that is not on the
// standard; it reports `ready: false` and the run keeps today's DiscoLike path.
//
// Resolve order (Operator ruling 2026-09-02), the replier against the People table:
//   1. Final Email equals the reply email     2. Email equals it (both sides lowercased)
//   3. Contact Key equals first+last+the email's domain, built the way Waterfall Contacts Batch builds it
//   4. LinkedIn URL equals the lead's (lowercased, trailing slash stripped): the Alta reply without an email
// The formula ORs the keys so one call fetches every candidate; Pick Person applies the precedence.
const lead = $('Lead In').first().json || {};
const s = (v) => String(v == null ? '' : v).trim();
const base = s(lead.clayroots_base);
const email = s(lead.lead_email).toLowerCase();
const emailDomain = email.includes('@') ? email.split('@')[1] : '';
const linkedinKey = s(lead.linkedin_url).toLowerCase().replace(/\/+$/, '');
const r = $input.first().json || {};
const body = (r.body !== undefined) ? r.body : r;
const tables = (body && Array.isArray(body.tables)) ? body.tables : null;

const out = { base, email, emailDomain, contactKey: '', linkedinKey, ready: false, reason: '', peopleTableId: '', peopleTableName: '', companiesTableId: '', companiesTableName: '', peopleFields: {}, companiesFields: {}, matchOrder: [], peopleUrl: '' };
if (!tables) { out.reason = 'could not read the table list for base ' + base + ': ' + JSON.stringify(body).slice(0, 160); return [{ json: out }]; }

const byName = (n) => tables.find((x) => String(x.name || '').trim().toLowerCase() === n);
const people = byName('people');
const companies = byName('companies');
if (!people) { out.reason = 'base ' + base + ' has no People table'; return [{ json: out }]; }
if (!companies) { out.reason = 'base ' + base + ' has no Companies table'; return [{ json: out }]; }

// Field names as the base actually spells them (case-insensitive), so a formula never names a missing column (422).
const actual = (t, wanted) => { const f = (t.fields || []).find((x) => String(x.name || '').trim().toLowerCase() === wanted.toLowerCase()); return f ? f.name : ''; };
const PEOPLE_KEYS = ['Name', 'first_name', 'last_name', 'Title', 'Seniority', 'Department', 'Email', 'Final Email', 'Contact Key', 'LinkedIn URL', 'Phone', 'Domain', 'Company', 'Companies', 'Tag', 'Signals', 'Signal At', 'Campaigns', 'Status', 'Description', 'Industry Groups', 'Employees', 'Revenue Range', 'Country', 'State', 'City', 'Social URLs', 'Phones'];
const COMPANY_KEYS = ['Domain', 'Company', 'Description', 'Industry Groups', 'Employees', 'Revenue Range', 'Country', 'State', 'City', 'Tag', 'Signals', 'Signal At', 'Campaigns', 'Social URLs', 'Phones', 'Business Model', 'Keywords'];
for (const k of PEOPLE_KEYS) { const a = actual(people, k); if (a) out.peopleFields[k] = a; }
for (const k of COMPANY_KEYS) { const a = actual(companies, k); if (a) out.companiesFields[k] = a; }
out.peopleTableId = people.id; out.peopleTableName = people.name;
out.companiesTableId = companies.id; out.companiesTableName = companies.name;

// Contact Key, the Waterfall Contacts Batch recipe: cleaned first + cleaned last, lowercased, + domain, no separators.
const cleanFirst = (f) => { if (!f) return ''; let n = String(f).split(',')[0].trim().split(/\s+/)[0] || ''; return n.replace(/[^A-Za-z\-']/g, ''); };
const cleanLast = (f) => { if (!f) return ''; return String(f).split(',')[0].trim().split(/\s+/).join(' ').replace(/[^A-Za-z\-'\s]/g, '').trim(); };
const first = cleanFirst(lead.first_name), last = cleanLast(lead.last_name);
if (first && emailDomain) out.contactKey = (first.toLowerCase() + last.toLowerCase() + emailDomain).trim();

const q = (v) => '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
const parts = [];
if (email && out.peopleFields['Final Email']) { parts.push('LOWER({' + out.peopleFields['Final Email'] + '}) = ' + q(email)); out.matchOrder.push('Final Email'); }
if (email && out.peopleFields['Email']) { parts.push('LOWER({' + out.peopleFields['Email'] + '}) = ' + q(email)); out.matchOrder.push('Email'); }
if (out.contactKey && out.peopleFields['Contact Key']) { parts.push('LOWER({' + out.peopleFields['Contact Key'] + '}) = ' + q(out.contactKey)); out.matchOrder.push('Contact Key'); }
if (linkedinKey && out.peopleFields['LinkedIn URL']) { parts.push('LOWER(REGEX_REPLACE({' + out.peopleFields['LinkedIn URL'] + '} & "", "/+$", "")) = ' + q(linkedinKey)); out.matchOrder.push('LinkedIn URL'); }
if (!parts.length) { out.reason = 'People table carries none of Final Email / Email / Contact Key / LinkedIn URL, or the lead has neither an email nor a LinkedIn URL'; return [{ json: out }]; }
const formula = parts.length === 1 ? parts[0] : 'OR(' + parts.join(', ') + ')';
out.peopleUrl = 'https://api.airtable.com/v0/' + base + '/' + people.id + '?maxRecords=10&filterByFormula=' + encodeURIComponent(formula);
out.ready = true;
return [{ json: out }];
