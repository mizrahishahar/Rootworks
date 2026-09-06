// At most two bulk calls: the inboxes joining the gateway pool and the ones leaving it.
// Nothing fires when the SURBL controls failed, when the workspace has no gateway tag, or
// when the pool already matches the last check.
const b = $('Compute').first().json._b;
const ops = [];
if (b.gatewayTagId && b.controlsOk) {
  if (b.assign.length) ops.push({ action: 'ASSIGN', ids: b.assign });
  if (b.unassign.length) ops.push({ action: 'UNASSIGN', ids: b.unassign });
}
if (!ops.length) return [{ json: { _noop: true } }];
return ops.map(o => ({ json: { action: o.action, count: o.ids.length, body: { workspace_id: b.pvWorkspace, ids: o.ids, tag_id: b.gatewayTagId, action: o.action } } }));
