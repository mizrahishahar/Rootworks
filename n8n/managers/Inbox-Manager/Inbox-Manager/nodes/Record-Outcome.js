// Close one client: the Hub writes' failures join the client's entry, and the scratch space is dropped before the
// next client (it can hold the whole read-back, which must never be saved with the workflow).
const sd = $getWorkflowStaticData('global');
const cw = $('Loop Over Clients').first().json;
const res = (sd.results || [])[(sd.results || []).length - 1];
if (res && res.client === String(cw.clientName || '') && res.inboxes > 0) {
  // These three ran for this client: the write chain only runs when Decide emitted inbox rows.
  const items = (n) => { try { return $(n).all().map(i => (i && i.json) || {}); } catch (e) { return []; } };
  for (const [node, what] of [['Upsert Inbox Drift', 'inbox rows'], ['Upsert Domains', 'domain rows'], ['Update Client', 'client row']]) {
    const out = items(node);
    const errors = out.filter(j => j.error).length;
    if (!out.length) res.failed.push(what + ': the write returned nothing');
    else if (errors) res.failed.push(what + ': ' + errors + ' write(s) failed');
  }
}
delete sd.cw;
return [{ json: { done: true } }];
