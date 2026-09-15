// Restore State: the feed loop is done and the execution resumed from its last wait with empty
// static data. Snapshot State parked the run's state in its output before the first wait; it
// comes back here so Collect Feeds, the board and the run row read the run they belong to.
const sd = $getWorkflowStaticData('global');
let state = {};
try { state = $('Snapshot State').first().json._state || {}; } catch (e) {}
for (const k of Object.keys(state)) sd[k] = state[k];
sd.failed = sd.failed || []; sd.results = sd.results || []; sd.feeds = sd.feeds || []; sd.syncs = sd.syncs || [];
return [{ json: { restored: Object.keys(state).length } }];
