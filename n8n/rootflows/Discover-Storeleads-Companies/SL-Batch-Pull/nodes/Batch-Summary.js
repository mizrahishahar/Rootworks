// Batch Summary: the one answer this child gives its parent. The page counters from Process Batch,
// the landing counters from the helper, and this batch's landed domains so the parent can scope the
// contacts hand-off to the pull. Rows never cross the boundary; the payloads die with this
// execution. Every read of the helper is guarded, because the no-rows path skips it entirely.
const m = $('Process Batch').first().json || {};
let h = null; try { h = $('Insert Domains').first().json || null; } catch (e) {}
let domains = [];
try { if (h) domains = ($('Split Rows').all().map(i => String((i.json || {}).Domain || '').trim().toLowerCase()).filter(Boolean)); } catch (e) {}
const n = (v) => Number(v) || 0;
const failReasons = (h && Array.isArray(h.failed)) ? h.failed.slice(0, 5).map(f => (f.name ? f.name + ': ' : '') + f.reason) : [];
return [{ json: {
  next_cursor: m.next_cursor || '',
  has_next_page: !!m.has_next_page,
  pulled: n(m.pulled),
  kept: n(m.kept),
  upserted: n(h && h.upserted),
  newDomains: n(h && h.newDomains),
  existingDomains: n(h && h.existingDomains),
  withEmails: n(h && h.withEmails) || n(m.withEmails),
  dnc: n(h && h.dnc),
  failed: n(h && h.errors),
  failReasons: failReasons,
  errorPages: n(m.errorPages),
  errorReason: String(m.errorReason || ''),
  skipped: n(m.skipped),
  inactive: n(m.inactive),
  duplicate: n(m.duplicate) + n(h && h.duplicate),
  domains: domains
} }];
