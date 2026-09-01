// Loop Control: reads one batch summary, adds it to the running totals, and decides the next
// move: continue (next cursor or next query), retry once after Storeleads error pages, or
// done. A second round of error pages on the same cursor fails loud. Hard cap: 500 batches.
const res = $input.first().json;
const sd = $getWorkflowStaticData('global');
const st = sd.slBatchState;
if (!st) throw new Error('Loop state missing: Init Loop State did not run');
const queries = $('Init Loop State').first().json.queries || [];
st.batchNum = (st.batchNum || 0) + 1;
if (st.batchNum > 500) throw new Error('Storeleads batch loop hit the hard cap of 500 batches. Totals so far: pulled ' + st.totals.pulled + ', kept ' + st.totals.kept + ', upserted ' + st.totals.upserted + '. Last cursor: "' + st.cursor + '" (query ' + (st.qIndex + 1) + '/' + queries.length + ').');
if (res.errorPages && res.errorPages > 0) {
  if (st.retried) {
    throw new Error('Storeleads returned error pages twice for cursor "' + st.cursor + '" (provider ' + ((queries[st.qIndex] || {}).provider || '?') + ', query ' + (st.qIndex + 1) + '/' + queries.length + '). Totals so far: pulled ' + st.totals.pulled + ', kept ' + st.totals.kept + ', upserted ' + st.totals.upserted + '.');
  }
  st.retried = true;
  return [{ json: { action: 'retry', qIndex: st.qIndex, cursor: st.cursor, remaining: st.remaining } }];
}
st.retried = false;
const n = (k) => Number(res[k]) || 0;
st.totals.pulled += n('pulled');
st.totals.kept += n('kept');
st.totals.upserted += n('upserted');
st.totals.withEmails += n('withEmails');
st.totals.failed += n('failed');
st.totals.skipped += n('skipped');
st.totals.inactive += n('inactive');
st.totals.duplicate += n('duplicate');
st.failReasons = Array.isArray(st.failReasons) ? st.failReasons : [];
for (const x of (Array.isArray(res.failReasons) ? res.failReasons : [])) { if (st.failReasons.length < 5) st.failReasons.push(String(x)); }
st.remaining = Math.max(0, st.cap - st.totals.kept);
if (res.has_next_page && st.remaining > 0 && res.next_cursor) {
  st.cursor = String(res.next_cursor);
  return [{ json: { action: 'continue', qIndex: st.qIndex, cursor: st.cursor, remaining: st.remaining } }];
}
st.qIndex += 1;
st.cursor = '';
if (st.qIndex < queries.length && st.remaining > 0) {
  return [{ json: { action: 'continue', qIndex: st.qIndex, cursor: '', remaining: st.remaining } }];
}
return [{ json: Object.assign({ action: 'done' }, st.totals) }];
