// The ONLY thing that crosses back into the parent: counters, never rows.
// A helper owns no run-log row; its outcome rolls up into the caller's row.
const m = $('Format Batch').first().json;
let written = 0; try { written = $('Upsert Contacts').all().length; } catch (e) { written = 0; }
return [{ json: {
  delivered: Number(m.delivered) || 0,
  written,
  skipped: Number(m.skipped) || 0,
  companiesMatched: Number(m.companiesMatched) || 0,
  credits: Number(m.credits) || 0,
  failedChunks: Number(m.failedChunks) || 0,
  sqAllFailed: !!m.sqAllFailed,
  firstError: m.firstError || '',
  withContacts: Array.isArray(m.withContacts) ? m.withContacts : []
} }];
