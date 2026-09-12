// Load State: what prepare resolved becomes this run's state, and its pushes become one item each,
// because Alta takes one prospect per request. The state also goes into static data for the nodes
// before the wait; everything after it restores from the item Collect Push carries, since static
// data does not survive a 90-second Wait resume (two runs died exactly there, 2026-08-31 and
// 2026-09-01).
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const p = ($input.first() || {}).json || {};
const D = p.state || {};
sd[dk] = D;
const pushes = Array.isArray(p.pushes) ? p.pushes : [];
if (!p.ready || !pushes.length) return [{ json: { _none: true } }];
return pushes.map(x => ({ json: x }));
