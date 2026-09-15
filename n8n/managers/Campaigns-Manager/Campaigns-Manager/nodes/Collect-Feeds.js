// Collect Feeds: the deploy rows were created one per loop pass, four minutes apart, so each pass
// is its own run of Create Deploy Row and is read by run index. A row that failed to create is an
// error on the run, named by campaign; the campaign loses its FED tag so the report does not claim
// a feed that did not happen. Emits one item so the chain continues.
const sd = $getWorkflowStaticData('global');
const feeds = sd.feeds || [];
sd.fed = 0;
feeds.forEach((f, i) => {
  let r = {};
  try { const out = $('Create Deploy Row').all(0, i); r = (out[0] && out[0].json) || {}; } catch (e) { r = { error: 'no output for feed ' + (i + 1) }; }
  if (r.error || !r.id) {
    sd.failed.push(f.client + ': could not create the deploy row for "' + f.name + '": ' + JSON.stringify(r.error || r).slice(0, 160));
    for (const R of sd.results || []) R.fed = (R.fed || []).filter(c => c.rid !== f.rid);
  } else sd.fed++;
});
return [{ json: { fed: sd.fed, planned: feeds.length } }];
