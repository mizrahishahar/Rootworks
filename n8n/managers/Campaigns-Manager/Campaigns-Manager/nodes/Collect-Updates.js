// Collect Updates: the Stage writes came back; a failed write is an error on the run, named by
// campaign, and the report still says what the standard decided. Emits one item so the chain
// continues into the messages whether there were updates or none.
const sd = $getWorkflowStaticData('global');
const updates = sd.updates || [];
let results = [];
try { results = $('Update Stage').all().map(i => i.json || {}); } catch (e) {}
sd.updated = 0;
updates.forEach((u, i) => {
  const r = results[i] || {};
  if (r.error || (r.id && r.id !== u.id)) sd.failed.push(u.client + ': could not set Stage ' + u.Stage + ' on "' + u.name + '": ' + JSON.stringify(r.error || r).slice(0, 160));
  else sd.updated++;
});
return [{ json: { updated: sd.updated, planned: updates.length } }];
