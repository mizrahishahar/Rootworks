// One mode, one contract: a record pointer. The row carries the identifiers.
//   { baseId, tableId, recordId, signature_phone?, force?, clientRecordId? }
// signature_phone is optional because only the CALLER can have it: it comes from the
// lead's email thread, which no record id can reach. Handle New Lead passes it;
// a ClayRoots automation just sends the pointer.
const raw = $input.first().json;
const b = raw.body || raw;
const s = (v) => String(v == null ? '' : v).trim();
const HUB_BASE = 'appQG6dK0FIOhTxOl';
const baseId = s(b.baseId || b['Clayroots Base ID']) || HUB_BASE;
const tableId = s(b.tableId || b['Table ID']);
const recordId = s(b.recordId);
const out = {
  startedAt: new Date().toISOString(),
  baseId, tableId, recordId,
  hub: baseId === HUB_BASE,
  force: b.force === true || s(b.force) === 'true',
  clientRecordId: s(b.clientRecordId),
  signature_phone: s(b.signature_phone),
  _invalid: false, _error: '',
};
if (!baseId || !tableId || !recordId) { out._invalid = true; out._error = 'payload needs baseId + tableId + recordId'; }
return [{ json: out }];
