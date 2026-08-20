// Parses the Supersoniq REST phone unlock (/partner/v1/enrich/phone).
// Charged 10 credits (25 specialty) only when a phone is on file.
const prev = $('SQ Pick').first().json;
const j = Object.assign({}, prev); delete j.callBody;
const acc = j.acc;
const resp = $input.first().json;
let b = resp && resp.body !== undefined ? resp.body : resp;
if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
const code = Number((resp && resp.statusCode) || 0);
const isTollFree = (p) => { let x = String(p || '').replace(/\D/g, ''); if (x.length === 11 && x.charAt(0) === '1') x = x.slice(1); return x.length === 10 && /^(?:800|833|844|855|866|877|888)/.test(x); };
const plausible = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 7 && d.length <= 15; };
if (!b || typeof b !== 'object' || code >= 400) {
  if (code === 404) return [{ json: j }]; // no phone on file: a clean miss
  const msg = (b && (b.detail && JSON.stringify(b.detail).slice(0, 150) || b.error || b.message)) || ('HTTP ' + (code || '?'));
  acc.failed.push('supersoniq phone: ' + msg);
  return [{ json: j }];
}
let phone = '';
const dig = (x, depth) => { if (phone || !x || depth > 3) return; if (typeof x === 'string') return; if (Array.isArray(x)) { x.forEach((v) => dig(v, depth + 1)); return; } if (typeof x === 'object') { for (const k of ['phone', 'phone_number', 'mobile', 'mobile_phone', 'mobile_number', 'number']) { if (typeof x[k] === 'string' && plausible(x[k])) { phone = x[k].trim(); return; } } for (const v of Object.values(x)) dig(v, depth + 1); } };
dig(b, 0);
if (phone) {
  if (isTollFree(phone)) { if (!acc.tf) { acc.tf = phone; acc.tf_source = 'supersoniq-tollfree'; } }
  else { acc.phone = phone; acc.source = 'supersoniq'; }
}
return [{ json: j }];
