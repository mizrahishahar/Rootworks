// LeadMagic verdicts. Out-of-credits (the 402 class) is a SKIP, not an error:
// the account state, not the lead, refused the call. Rows stay retryable either way.
const prev = $('LM Prep').first().json;
const j = Object.assign({}, prev); delete j.callBody;
const acc = j.acc;
const resp = $input.first().json;
let b = resp && resp.body !== undefined ? resp.body : resp;
if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = {}; } }
if (!b || typeof b !== 'object') b = {};
const code = Number((resp && resp.statusCode) || 0);
const msg = String(b.message || b.error || '');
const isTollFree = (p) => { let x = String(p || '').replace(/\D/g, ''); if (x.length === 11 && x.charAt(0) === '1') x = x.slice(1); return x.length === 10 && /^(?:800|833|844|855|866|877|888)/.test(x); };
const plausible = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 7 && d.length <= 15; };
if (code === 402 || /credit|payment required|insufficient|quota/i.test(msg)) {
  acc.skipped.push('leadmagic: out of credits');
} else if (code >= 400) {
  acc.failed.push('leadmagic: HTTP ' + code + (msg ? ' (' + msg.slice(0, 100) + ')' : ''));
} else {
  const mobile = String(b.mobile_number || b.mobile || '').trim();
  if (mobile && plausible(mobile)) {
    if (isTollFree(mobile)) { if (!acc.tf) { acc.tf = mobile; acc.tf_source = 'leadmagic-tollfree'; } }
    else { acc.phone = mobile; acc.source = 'leadmagic'; }
  }
}
return [{ json: j }];
