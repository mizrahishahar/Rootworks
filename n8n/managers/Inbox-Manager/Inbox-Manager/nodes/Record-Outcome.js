// Close one client: what the run read and what the Hub took join the client's entry for the report, the Hub
// writes' failures join its errors, and the scratch space is dropped before the next client (it can hold the
// whole read-back, which must never be saved with the workflow).
const sd = $getWorkflowStaticData('global');
const cw = $('Loop Over Clients').first().json;
const res = (sd.results || [])[(sd.results || []).length - 1];
if (res && res.client === String(cw.clientName || '')) {
  const st = sd.cw && sd.cw.stats;
  res.read = { statsPages: st ? (st.pages || 0) : null, statsFailedPages: st ? st.failedPages : 0, statsFrom: st ? st.start : '', statsTo: st ? st.end : '' };
  res.hub = { inboxes: 0, domains: 0, client: 0 };
  if (res.inboxes > 0) {
    // These three ran for this client: the write chain only runs when Decide emitted inbox rows.
    const items = (n) => { try { return $(n).all().map(i => (i && i.json) || {}); } catch (e) { return []; } };
    for (const [node, what, key] of [['Upsert Inbox Drift', 'inbox rows', 'inboxes'], ['Upsert Domains', 'domain rows', 'domains'], ['Update Client', 'client row', 'client']]) {
      const out = items(node);
      const errors = out.filter(j => j.error).length;
      res.hub[key] = out.length - errors;
      if (!out.length) res.failed.push(what + ': the write returned nothing');
      else if (errors) res.failed.push(what + ': ' + errors + ' write(s) failed');
    }
  }
}
delete sd.cw;
return [{ json: { done: true } }];
