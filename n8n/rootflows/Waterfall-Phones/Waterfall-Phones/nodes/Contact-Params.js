// The Hub contact door (held for the lead handlers, unchanged behaviour): one contact, always a Hub
// Prospects row, answered synchronously. POST /webhook/waterfall-phones with
// { recordId, signature_phone?, force?, clientRecordId? } — Enrich Qualify new lead from PlusVibe,
// Email Bison and Alta all call it this way and put the number on their Slack cards.
// signature_phone exists only on this path: only a caller holding the RAW reply has it. Everything
// else this leg reads off the Hub row itself.
//
// This is NOT the Rootflow contract. The Rootflow runs on a client base's People view through the
// door /webhook/enrich-phones; this leg works one Hub Prospects row and writes phone + Phone Source
// there. Retiring it is the Operator's call.
const s = (v) => String(v == null ? '' : v).trim();
let b = null;
try { const w = $('Contact Door').first().json; if (w) b = w.body || w; } catch (e) { b = null; }
if (!b) b = {};
const recordId = s(b.recordId);
return [{ json: {
  startedAt: new Date().toISOString(),
  mode: 'caller',
  recordId,
  force: b.force === true || s(b.force) === 'true',
  clientRecordId: s(b.clientRecordId),
  signature_phone: s(b.signature_phone),
  _invalid: !recordId,
  _error: recordId ? '' : 'payload needs recordId',
} }];
