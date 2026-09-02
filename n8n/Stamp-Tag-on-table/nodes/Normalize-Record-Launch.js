const client = $input.first().json;
const launch = $('Read Launch Record').first().json;
const hook = $('Launch Webhook').first().json || {};
const q = hook.query || {};
const baseId = String(client['Clayroots Base ID'] || '').trim();
// The launch row names its table (People or Companies, blank = People); Resolve Table turns it into the id.
const table = String((launch['Table'] && launch['Table'].name) || launch['Table'] || '').trim();
const tag = String(q.tag || launch['Tag'] || '').trim();
const buildDate = String(q.buildDate || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) {
  throw new Error('The launch record does not resolve to a Clayroots Base ID. Nothing was written.');
}
return [{ json: { baseId, table, tag, buildDate, launchRecordId: String(launch.id || ''), triggerKind: 'webhook' } }];