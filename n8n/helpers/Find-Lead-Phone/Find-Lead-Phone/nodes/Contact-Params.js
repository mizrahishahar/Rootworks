// Find Lead Phone: one Hub Contacts row, answered synchronously. POST /webhook/waterfall-phones with
// { recordId, signature_phone?, force?, clientRecordId? }: Enrich Qualify new lead from PlusVibe,
// Email Bison and Alta all call it this way and put the number on their Slack cards. The path keeps
// its old name so the handlers are untouched.
// signature_phone exists only here: only a caller holding the RAW reply has it. Everything else is
// read off the Hub row itself. A helper writes no Hub Automations row: the handler's row carries the
// phone and where it came from.
const s = (v) => String(v == null ? '' : v).trim();
let b = null;
try { const w = $('Contact Door').first().json; if (w) b = w.body || w; } catch (e) { b = null; }
if (!b) b = {};
const recordId = s(b.recordId);
return [{ json: {
  startedAt: new Date().toISOString(),
  recordId,
  force: b.force === true || s(b.force) === 'true',
  clientRecordId: s(b.clientRecordId),
  signature_phone: s(b.signature_phone),
  _invalid: !recordId,
  _error: recordId ? '' : 'payload needs recordId',
} }];
