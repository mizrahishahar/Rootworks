// Note Email Bison Sync: the sync ran as a sub-workflow and handed back its summary, or died and
// the item carries the error. A dead sync means the numbers are stale, and the whole run stops at
// Decide: no Stage move, no feed, one red message, a Failed row that names it. A sync that finished
// with problems is fresh enough to run on; its problems land in this run's Errors.
const sd = $getWorkflowStaticData('global');
const SYNC = 'Sync Email Bison Campaigns to Hub';
const j = ($input.first() || {}).json || {};
sd.syncs = sd.syncs || [];
if (j.error || !j._sync) {
  const why = j.error ? String(typeof j.error === 'string' ? j.error : (j.error.message || JSON.stringify(j.error))).slice(0, 300) : 'returned no summary';
  sd.syncs.push({ sync: SYNC, ok: false, why });
  sd.failed.push(SYNC + ' failed: ' + why);
  if (!sd.abort) sd.abort = SYNC + ' failed: ' + why;
} else {
  sd.syncs.push(Object.assign({ sync: SYNC, ok: true }, j));
  for (const p of (j.problems || [])) sd.failed.push(SYNC + ': ' + p);
}
return [{ json: Object.assign({}, sd.launch) }];
