// The verdict. A direct number wins (the row's own phone, the reply signature, FullEnrich); a
// toll-free signature is the last resort and says so in its source. The response body is what the
// calling handler gets back synchronously and puts on its Slack card and in its own run row.
const j0 = $input.first().json;
const j = Object.assign({}, j0); delete j.body;
const toE164 = (raw) => {
  const t = String(raw || '').trim();
  if (!t) return '';
  const d = t.replace(/\D/g, '');
  if (t.charAt(0) === '+') return '+' + d;
  if (d.length === 11 && d.charAt(0) === '1') return '+' + d;
  if (d.length === 10 && d.charAt(0) !== '0') return '+1' + d;
  return t;
};
if (j._invalid) {
  j.result = { ok: false, error: j._error || 'invalid payload', phone: '', phone_source: 'none' };
  j._writeback = false;
  return [{ json: j }];
}
const acc = j.acc;
let phone = acc.phone, source = acc.source;
if (!phone && acc.tf) { phone = acc.tf; source = acc.tf_source; }
if (!phone) source = 'none';
phone = toE164(phone);
j.result = { ok: true, phone, phone_source: source, line_type: acc.line_type || '', tried: acc.tried, skipped: acc.skipped, failed: acc.failed, recordId: j.recordId || '' };
j._writeback = !!phone && source !== 'existing';
return [{ json: j }];
