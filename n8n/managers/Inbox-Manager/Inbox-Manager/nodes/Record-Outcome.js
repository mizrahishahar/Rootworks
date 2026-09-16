// Close one client: what the run read and what the Hub took join the client's entry for the report, the client
// row write's failure joins its errors, and the scratch space is dropped before the next client (it can hold the
// whole read-back, which must never be saved with the workflow).
const sd = $getWorkflowStaticData('global');
const cw = $('Loop Over Clients').first().json;
const res = (sd.results || [])[(sd.results || []).length - 1];
if (res && res.client === String(cw.clientName || '')) {
  const st = sd.cw && sd.cw.stats;
  res.read = { statsPages: st ? (st.pages || 0) : null, statsFailedPages: st ? st.failedPages : 0, statsFrom: st ? st.start : '', statsTo: st ? st.end : '' };
  res.hub = { client: 0 };
  let out = [];
  try { out = $('Update Client').all().map(i => (i && i.json) || {}); } catch (e) {}
  const errors = out.filter(j => j.error).length;
  res.hub.client = out.length - errors;
  if (!out.length) res.failed.push('client row: the write returned nothing');
  else if (errors) res.failed.push('client row: the write failed');
}
delete sd.cw;
return [{ json: { done: true } }];
