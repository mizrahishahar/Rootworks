// Loop Control: reads one batch summary, adds it to the running totals, and decides the next move:
// continue (next cursor or next query), retry once after Storeleads error pages, or done.
//
// A provider that cannot be reached is a logged skip, never a crash (the Rootflows standard): error
// pages are retried once, and a second round on the same cursor stops THIS query with a reason
// instead of throwing. Same for the 500-batch guard. Build Log names every stop, and the row closes
// Failed only when nothing at all was pulled.
const res = $input.first().json || {};
const sd = $getWorkflowStaticData('global');
const st = sd.slBatchState;
if (!st) throw new Error('Loop state missing: Init Loop State did not run');
const queries = $('Init Loop State').first().json.queries || [];
const provider = () => String(((queries[st.qIndex] || {}).provider) || '?');
const nextQuery = (why) => {
  if (why) { st.stoppedWhy = (st.stoppedWhy ? st.stoppedWhy + '; ' : '') + why; }
  st.qIndex += 1; st.cursor = ''; st.retried = false;
  if (st.qIndex < queries.length && st.remaining > 0) return [{ json: { action: 'continue', qIndex: st.qIndex, cursor: '', remaining: st.remaining } }];
  return [{ json: Object.assign({ action: 'done' }, st.totals) }];
};
st.batchNum = (st.batchNum || 0) + 1;
if (st.batchNum > 500) {
  st.stoppedWhy = (st.stoppedWhy ? st.stoppedWhy + '; ' : '') + 'the batch loop hit its hard cap of 500 batches at cursor "' + st.cursor + '" (provider ' + provider() + ', query ' + (st.qIndex + 1) + '/' + queries.length + ')';
  return [{ json: Object.assign({ action: 'done' }, st.totals) }];
}
if (res.errorPages && res.errorPages > 0 && !res.pulled) {
  if (!st.retried) { st.retried = true; return [{ json: { action: 'retry', qIndex: st.qIndex, cursor: st.cursor, remaining: st.remaining } }]; }
  st.providerErrors = (st.providerErrors || 0) + Number(res.errorPages || 0);
  if (!st.providerReason) st.providerReason = String(res.errorReason || 'Storeleads returned error pages twice').slice(0, 160);
  return nextQuery('Storeleads returned error pages twice for cursor "' + st.cursor + '" (provider ' + provider() + ', query ' + (st.qIndex + 1) + '/' + queries.length + '), so that query was dropped');
}
st.retried = false;
const n = (k) => Number(res[k]) || 0;
if (res.errorPages) { st.providerErrors = (st.providerErrors || 0) + n('errorPages'); if (!st.providerReason && res.errorReason) st.providerReason = String(res.errorReason).slice(0, 160); }
for (const k of ['pulled','kept','upserted','newDomains','existingDomains','withEmails','failed','skipped','inactive','duplicate','dnc']) { st.totals[k] = (Number(st.totals[k]) || 0) + n(k); }
st.failReasons = Array.isArray(st.failReasons) ? st.failReasons : [];
for (const x of (Array.isArray(res.failReasons) ? res.failReasons : [])) { if (st.failReasons.length < 5) st.failReasons.push(String(x)); }
st.landedDomains = Array.isArray(st.landedDomains) ? st.landedDomains : [];
for (const d of (Array.isArray(res.domains) ? res.domains : [])) {
  if (st.landedDomains.length >= (st.scopeCap || 20000)) { st.scopeOverflow = true; break; }
  st.landedDomains.push(String(d));
}
st.remaining = Math.max(0, st.cap - (Number(st.totals.kept) || 0));
if (res.has_next_page && st.remaining > 0 && res.next_cursor) {
  st.cursor = String(res.next_cursor);
  return [{ json: { action: 'continue', qIndex: st.qIndex, cursor: st.cursor, remaining: st.remaining } }];
}
return nextQuery('');
