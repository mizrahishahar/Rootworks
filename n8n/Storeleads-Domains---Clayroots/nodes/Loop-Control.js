const res = $input.first().json;
const sd = $getWorkflowStaticData('global');
const st = sd.slBatchState;
if (!st) throw new Error('Loop state missing: Init Loop State did not run');
const queries = $('Init Loop State').first().json.queries || [];
st.batchNum = (st.batchNum || 0) + 1;
if (st.batchNum > 500) throw new Error('Storeleads batch loop hit the hard cap of 500 batches. Totals so far: pulled ' + st.totals.pulled + ', inserted ' + st.totals.inserted + '. Last cursor: "' + st.cursor + '" (query ' + (st.qIndex + 1) + '/' + queries.length + ').');
if (res.errorPages && res.errorPages > 0) {
  if (st.retried) {
    throw new Error('Storeleads returned error pages twice for cursor "' + st.cursor + '" (provider ' + ((queries[st.qIndex] || {}).provider || '?') + ', query ' + (st.qIndex + 1) + '/' + queries.length + '). Totals so far: pulled ' + st.totals.pulled + ', inserted ' + st.totals.inserted + ', withEmails ' + st.totals.withEmails + '.');
  }
  st.retried = true;
  return [{ json: { action: 'retry', qIndex: st.qIndex, cursor: st.cursor, remaining: st.remaining } }];
}
st.retried = false;
st.totals.pulled += Number(res.pulled) || 0;
st.totals.inserted += Number(res.inserted) || 0;
st.totals.withEmails += Number(res.withEmails) || 0;
st.totals.skipped = (Number(st.totals.skipped) || 0) + (Number(res.skipped) || 0);
st.remaining = Math.max(0, st.cap - st.totals.inserted);
if (res.has_next_page && st.remaining > 0 && res.next_cursor) {
  st.cursor = String(res.next_cursor);
  return [{ json: { action: 'continue', qIndex: st.qIndex, cursor: st.cursor, remaining: st.remaining } }];
}
st.qIndex += 1;
st.cursor = '';
if (st.qIndex < queries.length && st.remaining > 0) {
  return [{ json: { action: 'continue', qIndex: st.qIndex, cursor: '', remaining: st.remaining } }];
}
return [{ json: { action: 'done', pulled: st.totals.pulled, inserted: st.totals.inserted, withEmails: st.totals.withEmails, skipped: st.totals.skipped } }];