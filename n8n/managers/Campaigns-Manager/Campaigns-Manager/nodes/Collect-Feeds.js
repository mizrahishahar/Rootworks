// Collect Feeds: the deploy rows came back. A row that failed to create is an error on the run,
// named by campaign; the campaign loses its FED tag so the report does not claim a feed that did
// not happen. Emits one item so the chain continues.
const sd = $getWorkflowStaticData('global');
const feeds = sd.feeds || [];
let results = [];
try { results = $('Create Deploy Row').all().map(i => i.json || {}); } catch (e) {}
sd.fed = 0;
feeds.forEach((f, i) => {
  const r = results[i] || {};
  if (r.error || !r.id) {
    sd.failed.push(f.client + ': could not create the deploy row for "' + f.name + '": ' + JSON.stringify(r.error || r).slice(0, 160));
    for (const R of sd.results || []) R.fed = R.fed.filter(c => c.rid !== f.rid);
  } else sd.fed++;
});
return [{ json: { fed: sd.fed, planned: feeds.length } }];
