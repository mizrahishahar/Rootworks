const sd = $getWorkflowStaticData('global');
const launch = sd.launch || {};
const results = sd.results || [];
const failed = results.reduce((a, r) => a.concat((r.failed || []).map(f => r.client + ': ' + f)), []);
const totalInboxes = results.reduce((s, r) => s + (r.inboxes || 0), 0);
const totalDomains = results.reduce((s, r) => s + (r.domains || []).length, 0);
const totalFlagged = results.reduce((s, r) => s + (r.domains || []).filter(d => d.flags.length).length, 0);
const totalEmergencies = results.reduce((s, r) => s + (r.emergencies || []).length, 0);

const expected = Number(sd.messages || 0);
let posted = 0;
if (expected) {
  let items = [];
  try { items = $('Post to Slack').all().map(i => (i && i.json) || {}); } catch (e) {}
  posted = items.filter(j => !j.error && (j.ok === true || (j.message && j.message.ts) || j.ts)).length;
  if (posted < expected) failed.push('Slack: ' + (expected - posted) + ' of ' + expected + ' message(s) not posted to #flowroots-infra');
}

const skipped = [];
const lines = results.map(r => {
  const ch = r.changes || {};
  const a = r.allocation || {};
  if (a.skipped) skipped.push(r.client + ': campaign senders, ' + a.skipped);
  // A dry run's planned corrections carry "(not applied)", the same marker as the Slack report.
  const na = r.live ? '' : ' (not applied)';
  const bits = [
    r.inboxes + ' inbox(es)', (r.domains || []).length + ' domain(s)', (r.domains || []).filter(d => d.flags.length).length + ' flagged',
    (r.emergencies || []).length + ' emergency inbox(es)',
  ];
  if (ch.reconnect && ch.reconnect.planned) bits.push('reconnect ' + (r.live ? ch.reconnect.held + ' held of ' + ch.reconnect.tried : ch.reconnect.planned + na));
  if (ch.warmup && ch.warmup.planned) bits.push('warmup on ' + (r.live ? ch.warmup.on + ' of ' + ch.warmup.tried : ch.warmup.planned + na));
  if (ch.settings && ch.settings.planned) bits.push('settings back ' + (r.live ? ch.settings.fixed + ' of ' + ch.settings.tried : ch.settings.planned + na));
  if (a.campaigns != null) bits.push('senders ' + a.changed + ' campaign(s) changed, +' + a.added + ' -' + a.removed);
  return '- **' + r.client + ':** ' + bits.join(', ');
});

const parts = [
  '**' + results.length + ' client(s), ' + totalInboxes + ' inbox(es), ' + totalDomains + ' domain(s), ' + totalFlagged + ' flagged, ' + totalEmergencies + ' emergency inbox(es)**',
  '**Scope:** ' + (sd.scope || 'all clients'),
  '**Read:** ' + (launch.full ? 'full (Monday or launched)' : 'daily'),
  '**Corrections:** ' + (launch.live ? 'live' : 'dry run, planned and reported, nothing applied'),
  '**Slack:** ' + (expected ? posted + ' of ' + expected + ' message(s) posted to #flowroots-infra' : 'nothing to post'),
  '',
].concat(lines);
if (launch.clientFilter && !results.length) skipped.push('client filter matched no client with a sender workspace');
if (skipped.length) parts.push('', '**Skipped (' + skipped.length + ')**', ...skipped.map(s => '- ' + s));
if (failed.length) parts.push('', '**Errors**', ...failed.map(f => '- ' + f));

const row = {
  'Automation': 'Inbox Manager',
  'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
  'Run at': $now.toISO(),
  'Records In': totalInboxes,
  'Records Out': results.filter(r => r.hub && r.hub.client).length,
  'Errors': failed.length,
  'Target': 'Clients',
  'Trigger': launch.trigger || 'schedule',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Duration s': Math.round(($now.toMillis() - (launch.startedAt || $now.toMillis())) / 1000),
  'Description': parts.join('\n'),
};
// Client is attached only when the run served exactly one client; never an empty link array.
if (launch.clientFilter) row['Client'] = [launch.clientFilter];
return [{ json: row }];
