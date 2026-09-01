// Batch Summary: counters only back to the parent loop; rows never cross the boundary.
// upserted counts the upsert's own output, the items that came back with a record id;
// every other item is a failed row with its reason, so Records Out is what actually landed.
// withEmails is read after Clean Fields, from public_emails_clean, so the count is the
// cleaned truth and the blacklist lives in one place.
const m = $('Process Batch').first().json;
const kept = Number(m.kept) || 0;
let upserted = 0; let failed = 0; const failReasons = []; let withEmails = 0;
try {
  for (const it of $('Upsert Companies').all()) {
    const j = it.json || {};
    if (j.id) { upserted++; continue; }
    failed++;
    if (failReasons.length < 3) failReasons.push(String(j.error || j.message || 'no record id came back').slice(0, 120));
  }
} catch (e) {}
try { for (const it of $('Clean Fields').all()) { const j = it.json || {}; if (String(j.public_emails_clean || '').trim()) withEmails++; } } catch (e) {}
const unaccounted = Math.max(0, kept - upserted - failed);
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
  errorPages: Number(m.errorPages) || 0,
  skipped: Number(m.skipped) || 0,
  inactive: Number(m.inactive) || 0,
  duplicate: Number(m.duplicate) || 0
} }];
