// Prepare Out: everything the caller needs, on one item. The state travels as DATA from here on,
// never as static data across the call boundary: the door carries it through its send lane and
// hands it straight back to finish. Two runs died at an Alta readback because workflow static data
// does not survive a Wait resume (2026-08-31 and 2026-09-01); an item does.
// The slot this run used in THIS machine's static data is deleted, not nulled: every prepare would
// otherwise leave a key behind forever.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
delete sd[dk];
// isPV is the EMAIL lane (PlusVibe and Email Bison both queue chunks); the first chunk's request
// body is shaped per sender below.
const isPV = D.sender === 'PlusVibe' || D.sender === 'Email Bison';
const isBison = D.sender === 'Email Bison';
const out = {
  ok: !D.abort,
  ready: !D.abort && !!D.ready,
  abort: D.abort || '',
  rowsTotal: D.rowsTotal || 0,
  queued: isPV ? ((D.send && D.send.queue) ? D.send.queue.reduce((n, c) => n + (c ? c.length : 0), 0) : 0) : (D.pushes || []).length,
  ws: D.ws || '', target: D.target || '', campName: D.campName || '', launchId: D.launchId || '',
  state: D
};
if (isPV) {
  const q = (D.send && D.send.queue) || [];
  out.body = q.length
    ? (isBison ? Object.assign({ leads: q[0] }, D.flags || {}) : Object.assign({ workspace_id: D.ws, campaign_id: D.target, leads: q[0] }, D.flags || {}))
    : null;
} else {
  out.pushes = D.pushes || [];
  D.pushes = null;
}
return [{ json: out }];
