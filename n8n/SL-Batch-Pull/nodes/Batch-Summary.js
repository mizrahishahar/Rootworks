// Batch Summary: counters only back to the parent loop; rows never cross the boundary. The
// landing counts are the helper's (Insert domains to Clayroots): upserted is what came back
// with a record id, failed carries its reasons, dnc the domains the client's DNC table kept
// out, withEmails the cleaned public_emails_clean truth. A batch with no rows never called the
// helper and reports zeros.
const m = $('Process Batch').first().json;
const kept = Number(m.kept) || 0;
let h = null; try { h = $('Insert Domains').first().json || null; } catch (e) {}
const upserted = h ? (Number(h.upserted) || 0) : 0;
let failed = h ? (Number(h.errors) || 0) : 0;
const failReasons = (h && Array.isArray(h.failed) ? h.failed : []).slice(0, 3).map(f => String(f.name) + ': ' + String(f.reason)).map(s => s.slice(0, 120));
const dnc = h ? (Number(h.dnc) || 0) : 0;
const withEmails = h ? (Number(h.withEmails) || 0) : 0;
const unaccounted = Math.max(0, kept - dnc - upserted - failed);
if (unaccounted) { failed += unaccounted; if (failReasons.length < 3) failReasons.push(unaccounted + ' rows returned no record id'); }
return [{ json: {
  next_cursor: m.next_cursor || '',
  has_next_page: !!m.has_next_page,
  pulled: Number(m.pulled) || 0,
  kept: kept,
  upserted: upserted,
  failed: failed,
  failReasons: failReasons,
  withEmails: withEmails,
  dnc: dnc,
  errorPages: Number(m.errorPages) || 0,
  skipped: Number(m.skipped) || 0,
  inactive: Number(m.inactive) || 0,
  duplicate: Number(m.duplicate) || 0
} }];
