// Builds the canonical person + the waterfall accumulator from the fetched row.
// Two row shapes, decided by the base: Hub Contacts (firstName/lastName/email/phone,
// domain + CompanyName as lookups) vs ClayRoots contacts (Name/first_name/Email/Final
// Email/Domain/Social/Phone). Tier 0 (signature) is applied here from the payload.
const p0 = $('Params').first().json;
const s = (v) => { if (Array.isArray(v)) v = v[0]; return String(v == null ? '' : v).trim(); };
let f = null;
try { const r = $('Fetch Row').first().json || {}; f = r.fields || (r.id ? r : null); } catch (e) { f = null; }
const acc = { phone: '', source: 'none', tf: '', tf_source: '', tried: [], skipped: [], failed: [] };
const out = { baseId: p0.baseId, tableId: p0.tableId, recordId: p0.recordId, hub: p0.hub, force: p0.force, clientRecordId: p0.clientRecordId, person: {}, acc, _invalid: p0._invalid, _error: p0._error };
if (out._invalid) return [{ json: out }];
if (!f) { out._invalid = true; out._error = 'record ' + p0.recordId + ' not readable in ' + p0.tableId; return [{ json: out }]; }
const FREEMAIL = new Set(['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','aol.com','proton.me','protonmail.com','live.com','msn.com','gmx.com','mail.com','walla.co.il','walla.com']);
const email = (s(f['Final Email']) || s(f.Email) || s(f.email)).toLowerCase();
let domain = (s(f.Domain) || s(f.domain)).toLowerCase();
if (!domain && email.includes('@')) { const d = email.split('@')[1]; if (d && !FREEMAIL.has(d)) domain = d; }
const person = {
  email,
  first_name: s(f.first_name) || s(f.firstName),
  last_name: s(f.last_name) || s(f.lastName),
  full_name: s(f.Name) || s(f.fullName),
  domain,
  linkedin: s(f.Social) || s(f.LinkedIn) || s(f.linkedin) || s(f.linkedin_url),
};
out.person = person;
const existingPhone = s(f.Phone) || s(f.phone);
const isTollFree = (p) => { let x = String(p || '').replace(/\D/g, ''); if (x.length === 11 && x.charAt(0) === '1') x = x.slice(1); return x.length === 10 && /^(?:800|833|844|855|866|877|888)/.test(x); };
if (existingPhone && !p0.force) { acc.phone = existingPhone; acc.source = 'existing'; return [{ json: out }]; }
const sig = p0.signature_phone;
if (sig) {
  acc.tried.push('signature');
  if (isTollFree(sig)) { acc.tf = sig; acc.tf_source = 'signature-tollfree'; }
  else { acc.phone = sig; acc.source = 'signature'; }
}
return [{ json: out }];
