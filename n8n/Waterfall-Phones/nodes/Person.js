// Builds the person and the waterfall accumulator from the Hub Contacts row.
const p0 = $('Params').first().json;
const s = (v) => { if (Array.isArray(v)) v = v[0]; return String(v == null ? '' : v).trim(); };
let f = null;
try { const r = $('Fetch Row').first().json || {}; f = r.fields || (r.id ? r : null); } catch (e) { f = null; }
const acc = { phone: '', source: 'none', tf: '', tf_source: '', tried: [], skipped: [], failed: [] };
const out = { recordId: p0.recordId, force: p0.force, clientRecordId: p0.clientRecordId, person: {}, companyId: '', acc, _invalid: p0._invalid, _error: p0._error };
if (out._invalid) return [{ json: out }];
if (!f) { out._invalid = true; out._error = 'contact ' + p0.recordId + ' not readable'; return [{ json: out }]; }
const FREEMAIL = new Set(['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','aol.com','proton.me','protonmail.com','live.com','msn.com','gmx.com','mail.com','walla.co.il','walla.com']);
const email = s(f.email).toLowerCase();
let domain = s(f.domain).toLowerCase();
if (!domain && email.includes('@')) { const d = email.split('@')[1]; if (d && !FREEMAIL.has(d)) domain = d; }
out.person = {
  email,
  first_name: s(f.firstName),
  last_name: s(f.lastName),
  full_name: (s(f.firstName) + ' ' + s(f.lastName)).trim(),
  domain,
  linkedin: s(f.linkedin),
};
// The contact links to its company Prospect row, which carries the synced
// Conversation Thread. The scrape step reads it for a signature phone.
const link = f.Company;
if (Array.isArray(link) && link.length) out.companyId = String(link[0] && link[0].id ? link[0].id : link[0]);
else if (link && Array.isArray(link.linkedRecordIds) && link.linkedRecordIds.length) out.companyId = String(link.linkedRecordIds[0]);
const isTollFree = (p) => { let x = String(p || '').replace(/\D/g, ''); if (x.length === 11 && x.charAt(0) === '1') x = x.slice(1); return x.length === 10 && /^(?:800|833|844|855|866|877|888)/.test(x); };
const existingPhone = s(f.phone);
if (existingPhone && !p0.force) { acc.phone = existingPhone; acc.source = 'existing'; return [{ json: out }]; }
const sig = p0.signature_phone;
if (sig) {
  acc.tried.push('signature');
  if (isTollFree(sig)) { acc.tf = sig; acc.tf_source = 'signature-tollfree'; }
  else { acc.phone = sig; acc.source = 'signature'; }
}
return [{ json: out }];
