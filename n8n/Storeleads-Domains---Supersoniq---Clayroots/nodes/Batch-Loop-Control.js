// Reads one Batch Summary, accumulates, decides continue / retry / done.
// Mirrors SL Batch Pull's Loop Control: retry a Supersoniq-dead batch once after the
// Wait, then fail loudly with totals so the crash row says how far the run got.
// An empty batch (zero contacts) is a normal tick, never an end condition.
const res = $input.first().json;
const sd = $getWorkflowStaticData('global');
const st = sd.cbState;
if (!st) throw new Error('Loop state missing: Init Contact Batches did not run');
const batchCount = Number($('Init Contact Batches').first().json.batchCount) || 0;
st.bNum = (st.bNum || 0) + 1;
if (st.bNum > 500) throw new Error('Contact batch loop hit the hard cap of 500 iterations. Totals so far: delivered ' + st.totals.delivered + ', written ' + st.totals.written + '. Batch index: ' + st.bIndex + '/' + batchCount + '.');
if (res.sqAllFailed) {
  if (st.retried) {
    throw new Error('Supersoniq enrich failed twice for batch ' + (st.bIndex + 1) + '/' + batchCount + ': ' + (res.firstError || 'no response detail') + '. Totals so far: delivered ' + st.totals.delivered + ', written ' + st.totals.written + ', credits ' + st.totals.credits + '.');
  }
  st.retried = true;
  return [{ json: { action: 'retry', bIndex: st.bIndex } }];
}
st.retried = false;
st.totals.delivered += Number(res.delivered) || 0;
st.totals.written += Number(res.written) || 0;
st.totals.skipped += Number(res.skipped) || 0;
st.totals.credits += Number(res.credits) || 0;
st.totals.companiesMatched += Number(res.companiesMatched) || 0;
st.totals.failedChunks += Number(res.failedChunks) || 0;
for (const d of (res.withContacts || [])) st.withContacts[d] = 1;
st.bIndex = (st.bIndex || 0) + 1;
if (st.bIndex < batchCount) {
  return [{ json: { action: 'continue', bIndex: st.bIndex } }];
}
if (!st.totals.delivered) {
  throw new Error('Supersoniq returned no usable contacts for ' + ($('Parse Domains').first().json._domain_count) + ' domain(s) across ' + batchCount + ' batch(es). Rows skipped for an empty Contact Key: ' + st.totals.skipped + '.');
}
return [{ json: Object.assign({ action: 'done' }, st.totals) }];
