// Parses the Supersoniq REST resolution response (/partner/v1/companies/enrich,
// naked tier + has_phone filter), matches the contact by name, and builds the
// /partner/v1/enrich/phone unlock body. A person Supersoniq doesn't know is a
// clean miss; a refused/unparseable call is a failure (retryable), never a negative.
const prev = $('SQ Prep').first().json;
const j = Object.assign({}, prev); delete j.callBody;
const acc = j.acc, p = j.person;
const resp = $input.first().json;
let b = resp && resp.body !== undefined ? resp.body : resp;
if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
const code = Number((resp && resp.statusCode) || 0);
const out = (call, body) => [{ json: Object.assign({}, j, { _call: call ? 1 : 0 }, body ? { callBody: body } : {}) }];
if (!b || typeof b !== 'object' || code >= 400) {
  const msg = (b && (b.detail && JSON.stringify(b.detail).slice(0, 150) || b.error || b.message)) || ('HTTP ' + (code || '?'));
  acc.failed.push('supersoniq resolve: ' + msg);
  return out(0);
}
const contacts = [];
const walk = (x) => { if (!x) return; if (Array.isArray(x)) { x.forEach(walk); return; } if (typeof x === 'object') { if (Array.isArray(x.contacts)) contacts.push(...x.contacts); for (const v of Object.values(x)) { if (v && typeof v === 'object') walk(v); } } };
walk(b);
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
const wantF = norm(p.first_name), wantL = norm(p.last_name);
const wantFull = norm(p.full_name) || (wantF + wantL);
let match = null;
for (const ct of contacts) {
  const f = norm(ct.first_name), l = norm(ct.last_name);
  const full = norm(ct.full_name) || (f + l);
  if (wantF && wantL && f === wantF && l === wantL) { match = ct; break; }
  if (wantFull && full && full === wantFull) { match = ct; break; }
}
if (!match && contacts.length === 1 && wantF && norm(contacts[0].first_name) === wantF) match = contacts[0];
const cid = match && (match.contact_id || match.id || match.uuid);
if (!cid) return out(0); // not in Supersoniq, or no id in the payload: a miss, next tier
return out(1, { contact_id: String(cid) });
