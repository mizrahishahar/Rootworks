// Check PV Campaign: the target must exist in the client's workspace, proven by the workspace's
// own campaign listing, before a single lead is uploaded. This is the one campaign check the
// shared machine cannot do: PlusVibe's campaign list is a PlusVibe call, and the Hub row is only
// the description of a campaign, not proof that it is there.
// The name PlusVibe itself carries wins for the run log and the receipt.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
const p = $('Load State').first().json;
if (!D.abort) {
  const camps = [];
  for (const it of $input.all()) {
    const j = it.json || {};
    const arr = Array.isArray(j) ? j : (Array.isArray(j.campaigns) ? j.campaigns : (Array.isArray(j.data) ? j.data : ((j.id || j._id) ? [j] : [])));
    for (const x of arr) { if (x && (x.id || x._id)) camps.push(x); }
  }
  const hit = camps.find(x => String(x.id || x._id) === D.target);
  if (!hit) { D.abort = 'campaign not found'; D.errors.push('campaign ' + D.target + ' not found in workspace ' + D.ws + ' (' + camps.length + ' campaigns listed); nothing was sent'); }
  else { D.campName = hit.camp_name || hit.name || D.campName || D.target; }
}
const ready = !D.abort && !!p.ready;
return [{ json: { ready: ready, abort: !!D.abort, body: ready ? p.body : null, wait: 0 } }];
