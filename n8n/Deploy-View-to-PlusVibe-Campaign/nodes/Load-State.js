// Load State: what prepare resolved becomes this run's state. It lives in static data for the
// length of the send lane only, because the chunk loop's Wait is seconds long and keeps the
// execution in memory; Close Deploy takes it back off and hands it to finish as data.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const p = ($input.first() || {}).json || {};
const D = p.state || {};
sd[dk] = D;
return [{ json: { ws: D.ws || 'none', ready: !!p.ready, abort: !!D.abort, body: p.body || null } }];
