// Resolve Mirror: the campaign's mirror row in the client base, resolved BEFORE anything is sent,
// because it is both the stamp target and the stamp-gate (Operator ruling 2026-08-28: a row whose
// Campaigns links already carry this campaign's mirror row never re-enters the campaign, on top of
// whatever the sequencer's own dedupe would say). No mirror row yet, on the first deploy into a
// campaign, resolves to '' and gates nothing until the next node creates it.
// A failed lookup must never create: a duplicate mirror row would split the links.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
D.stampMirrorRid = '';
let rid = '', err = '';
for (const it of $input.all()) {
  const j = it.json || {};
  if (j.error) { if (!err) err = JSON.stringify(j.error).slice(0, 150); }
  else if (j.id && !rid) rid = j.id;
}
if (err) D.warnings.push('mirror row lookup failed: ' + err + '; Campaigns not stamped');
D.stampMirrorRid = rid || '';
const need = !D.abort && !!D.mirrorTableId && !rid && !err;
return [{ json: { needMirror: need, mirrorTableId: D.mirrorTableId || 'tblMISSING', crBase: D.crBase || 'appMISSING', campName: D.campName || D.target || '', target: D.target || '', sequencer: D.sender } }];
