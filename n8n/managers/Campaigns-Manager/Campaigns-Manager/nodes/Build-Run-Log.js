// Build Run Log: the run's one Hub row. Status computed from failed[], skips separate, the
// Description a human reads at a glance: scope, per client what is in play and what moved.
const sd = $getWorkflowStaticData('global');
const launch = sd.launch || {};
const results = sd.results || [];
const failed = (sd.failed || []).slice();
const updates = sd.updates || [];

let posted = 0;
try {
  for (const it of $('Post to Slack').all()) { const j = it.json || {}; if (j._none) continue; if (j.error) failed.push('Slack post failed: ' + JSON.stringify(j.error).slice(0, 160)); else if (j.ok || j.ts || j.message) posted++; }
} catch (e) {}

const lines = results.map(R => {
  const inPlay = R.testProgress.length + R.testReady.length + R.scaleProgress.length + R.scaleReady.length + R.run.length;
  const moved = R.moved.map(c => '"' + c.name + '" ' + c.verdict).join(', ');
  const dry = [].concat(R.testProgress, R.scaleProgress, R.run).filter(c => (c.tags || []).some(t => t.indexOf('DRY') === 0 || t === 'NO VIEW' || t === 'SHARED VIEW')).map(c => '"' + c.name + '" ' + c.tags.filter(t => t !== 'LINKEDIN').join(', ')).join('; ');
  return '- **' + R.client + ':** ' + inPlay + ' in play (Test ' + (R.testProgress.length + R.testReady.length) + ', Scale ' + (R.scaleProgress.length + R.scaleReady.length) + ', Run ' + R.run.length + '), ' + R.scaleReady.length + ' ready to judge, ' + R.paused.length + ' paused by hand' + (moved ? '. Moved: ' + moved : '') + (dry ? '. Flags: ' + dry : '');
});

const parts = [
  '**' + (sd.managed || 0) + ' managed campaign(s) across ' + results.length + ' client(s), ' + (sd.updated || 0) + ' stage move(s), ' + posted + ' message(s) posted**',
  '**Scope:** ' + (sd.scope || 'all clients'),
  '**Slack:** ' + (posted ? posted + ' message(s) to #flowroots-campaigns' : 'nothing posted'),
].concat(lines);
if (!results.length) parts.push('**Skipped (1, ' + (launch.clientFilter ? 'client filter matched no managed campaign' : 'no campaign carries a Stage') + ')**');
if (failed.length) parts.push('', '**Errors**', ...failed.map(f => '- ' + f));

const row = {
  'Automation': 'Campaigns Manager',
  'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
  'Run at': $now.toISO(),
  'Records In': sd.managed || 0,
  'Records Out': sd.updated || 0,
  'Errors': failed.length,
  'Target': 'Campaigns',
  'Trigger': launch.trigger || 'schedule',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Duration s': Math.round(($now.toMillis() - (launch.startedAt || $now.toMillis())) / 1000),
  'Description': parts.join('\n'),
};
// Client is attached only when the run served exactly one client; never an empty link array.
if (launch.clientFilter) row['Client'] = [launch.clientFilter];
return [{ json: row }];
