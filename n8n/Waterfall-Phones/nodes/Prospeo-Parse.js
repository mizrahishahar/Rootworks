// Prospeo verdicts. NO_MATCH = clean miss. INSUFFICIENT_CREDITS = skip.
// A masked or unrevealed mobile is a miss, never written.
const prev = $('Prospeo Prep').first().json;
const j = Object.assign({}, prev); delete j.callBody;
const acc = j.acc;
const resp = $input.first().json;
let b = resp && resp.body !== undefined ? resp.body : resp;
if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
const code = Number((resp && resp.statusCode) || 0);
const isTollFree = (p) => { let x = String(p || '').replace(/\D/g, ''); if (x.length === 11 && x.charAt(0) === '1') x = x.slice(1); return x.length === 10 && /^(?:800|833|844|855|866|877|888)/.test(x); };
const plausible = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 7 && d.length <= 15; };
if (!b || typeof b !== 'object') { acc.failed.push('prospeo: unparseable response (HTTP ' + (code || '?') + ')'); return [{ json: j }]; }
const errCode = String(b.error_code || '');
if (b.error === true || errCode) {
  if (errCode === 'NO_MATCH') return [{ json: j }];
  if (errCode === 'INSUFFICIENT_CREDITS' || code === 402) acc.skipped.push('prospeo: out of credits');
  else acc.failed.push('prospeo: ' + (errCode || 'HTTP ' + code));
  return [{ json: j }];
}
const person = b.person || (b.response && b.response.person) || {};
let cand = person.mobile || person.mobile_phone || person.phone || '';
if (cand && typeof cand === 'object') {
  if (cand.revealed === false) cand = '';
  else cand = cand.number || cand.mobile || cand.raw || cand.international || '';
}
cand = String(cand || '').trim();
if (cand && cand.indexOf('*') === -1 && plausible(cand)) {
  if (isTollFree(cand)) { if (!acc.tf) { acc.tf = cand; acc.tf_source = 'prospeo-tollfree'; } }
  else { acc.phone = cand; acc.source = 'prospeo'; }
}
return [{ json: j }];
