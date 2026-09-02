// Enrich and Qualify Lead, base step 2: the one People row that is the replier, by the resolve order
// (Final Email, then Email, then Contact Key, then LinkedIn URL), out of the candidates the single search returned.
// Also plans the Companies read: the row's Companies link when it has one, else the row's Domain, so the
// company facts come from the base and never from a paid call. Not found = `person_found: false`, and the
// run keeps today's DiscoLike path.
const cfg = $('Resolve Base Tables').first().json || {};
const r = $input.first().json || {};
const body = (r.body !== undefined) ? r.body : r;
const records = (body && Array.isArray(body.records)) ? body.records : [];
const pf = cfg.peopleFields || {};
const lower = (v) => String(v == null ? '' : (Array.isArray(v) ? v[0] : v)).trim().toLowerCase();
const fieldOf = (rec, key) => { const f = (rec && rec.fields) || {}; const a = pf[key]; return a ? f[a] : undefined; };

let hit = null, match = '';
const email = cfg.email || '', key = cfg.contactKey || '';
if (email && pf['Final Email']) { hit = records.find((x) => lower(fieldOf(x, 'Final Email')) === email) || null; if (hit) match = 'Final Email'; }
if (!hit && email && pf['Email']) { hit = records.find((x) => lower(fieldOf(x, 'Email')) === email) || null; if (hit) match = 'Email'; }
if (!hit && key && pf['Contact Key']) { hit = records.find((x) => lower(fieldOf(x, 'Contact Key')) === key) || null; if (hit) match = 'Contact Key'; }
const li = cfg.linkedinKey || '';
if (!hit && li && pf['LinkedIn URL']) { hit = records.find((x) => lower(fieldOf(x, 'LinkedIn URL')).replace(/\/+$/, '') === li) || null; if (hit) match = 'LinkedIn URL'; }

const out = Object.assign({}, cfg, { person_found: !!hit, base_match: match, personRecordId: hit ? hit.id : '', personFields: hit ? (hit.fields || {}) : {}, companyLinkId: '', companyUrl: '', candidates: records.length, reason: '' });
if (!hit) {
  out.reason = records.length ? (records.length + ' candidate row(s) but none matched the resolve order') : (body && body.error ? 'People search failed: ' + JSON.stringify(body.error).slice(0, 160) : 'no People row matched ' + [email, key, li].filter(Boolean).join(' / '));
  return [{ json: out }];
}

const links = fieldOf(hit, 'Companies');
if (Array.isArray(links) && links.length) out.companyLinkId = String(links[0] && links[0].id ? links[0].id : links[0]);
const q = (v) => '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
let formula = 'FALSE()';
const cf = cfg.companiesFields || {};
if (out.companyLinkId) formula = 'RECORD_ID() = ' + q(out.companyLinkId);
else if (cf['Domain']) { const d = lower(fieldOf(hit, 'Domain')) || cfg.emailDomain || ''; if (d) formula = 'LOWER({' + cf['Domain'] + '}) = ' + q(d); }
out.companyUrl = 'https://api.airtable.com/v0/' + cfg.base + '/' + cfg.companiesTableId + '?maxRecords=1&filterByFormula=' + encodeURIComponent(formula);
return [{ json: out }];
