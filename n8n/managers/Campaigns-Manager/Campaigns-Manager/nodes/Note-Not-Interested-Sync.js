// Note Not Interested Sync: the DNC helper ran as a sub-workflow and handed back its summary, or
// died and the item carries the error. A dead DNC lane does not stale the campaign numbers, so it
// does not stop the run: it is an error on this row, named, and the run goes on. A lane that
// finished with problems lands them in this run's Errors.
const sd = $getWorkflowStaticData('global');
const SYNC = 'Sync PlusVibe Not Interested to DNC';
const j = ($input.first() || {}).json || {};
sd.syncs = sd.syncs || [];
if (j.error || !j._sync) {
  const why = j.error ? String(typeof j.error === 'string' ? j.error : (j.error.message || JSON.stringify(j.error))).slice(0, 300) : 'returned no summary';
  sd.syncs.push({ sync: SYNC, ok: false, why });
  sd.failed.push(SYNC + ' failed: ' + why);
} else {
  sd.syncs.push(Object.assign({ sync: SYNC, ok: true }, j));
  for (const p of (j.problems || [])) sd.failed.push(SYNC + ': ' + p);
}
return [{ json: Object.assign({}, sd.launch) }];
