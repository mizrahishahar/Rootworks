// One contact, always a Hub Contacts row, one execution regardless of trigger.
// Two ways in, converging here:
//   caller webhook: { recordId, signature_phone?, force?, clientRecordId? }  (Handle New Lead)
//   launch leg:     the Automations row, already resolved by Launch Params
// signature_phone exists only on the caller path: only a caller holding the RAW
// reply has it. Everything else the workflow reads off the row itself.
const s = (v) => String(v == null ? '' : v).trim();
let b = null, mode = 'caller';
try { const w = $('Webhook').first().json; if (w) b = w.body || w; } catch (e) { b = null; }
if (!b) {
  const lp = $('Launch Params').first().json;
  mode = 'launch';
  // The Operator named this contact deliberately, so re-run even if a number is on the row.
  b = { recordId: lp.contactId, clientRecordId: lp.clientId, force: true };
}
const recordId = s(b.recordId);
return [{ json: {
  startedAt: new Date().toISOString(),
  mode,
  recordId,
  force: b.force === true || s(b.force) === 'true',
  clientRecordId: s(b.clientRecordId),
  signature_phone: s(b.signature_phone),
  _invalid: !recordId,
  _error: recordId ? '' : 'payload needs recordId',
} }];
