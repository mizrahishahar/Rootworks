const sd = $getWorkflowStaticData('global');
const launch = sd.launch || {};
const results = sd.results || [];
const totalInboxes = results.reduce((s, r) => s + (r.inboxes || 0), 0);
const totalDomains = results.reduce((s, r) => s + (r.domains || 0), 0);
const totalFlagged = results.reduce((s, r) => s + (r.flagged || 0), 0);
const failed = results.reduce((a, r) => a.concat((r.failed || []).map(f => r.client + ': ' + f)), []);

let slackTs = '';
try { const s = $('Post to Slack').first().json; slackTs = String((s.message && s.message.ts) || s.ts || ''); } catch (e) {}
let allocLines = [];
try {
  const calls = $('Prep Allocate Calls').all().map(i => i.json).filter(c => !c._none);
  const res = $('Fire Allocate').all().map(i => i && i.json);
  allocLines = calls.map((c, i) => {
    const r = res[i] || {};
    const body = r.body === undefined ? r : r.body;
    const n = body && Array.isArray(body.campaigns) ? body.campaigns.length : 0;
    const changed = body && Array.isArray(body.campaigns)
      ? body.campaigns.reduce((s, x) => s + (x.added || []).length + (x.removed || []).length, 0) : 0;
    const ok = body && body.ok === true;
    if (!ok) failed.push(c.client + ': gateway allocation call failed');
    return '- **' + c.client + ':** ' + n + ' gateway campaign(s), ' + changed + ' sender change(s)';
  });
} catch (e) {}

const lines = results.map(r => '- **' + r.client + ':** ' + r.inboxes + ' inbox(es), ' + r.domains + ' domain(s), ' +
  r.flagged + ' flagged, gateway +' + r.assigned + '/-' + r.unassigned + (r.surblNote ? ' (' + r.surblNote + ')' : ''));

const parts = [
  '**' + results.length + ' client(s), ' + totalInboxes + ' inbox(es), ' + totalDomains + ' domain(s), ' + totalFlagged + ' flagged**',
  '**Scope:** ' + (sd.scope || 'all clients'),
  '**Slack:** ' + (slackTs ? 'posted to #flowroots-pulse (ts ' + slackTs + ')' : 'not posted'),
].concat(lines);
if (allocLines.length) parts.push('', '**Gateway allocation**', ...allocLines);
if (launch.clientFilter && !results.length) parts.push('**Skipped (1, client filter matched no PlusVibe client)**');
if (failed.length) parts.push('', '**Errors**', ...failed.map(f => '- ' + f));

const row = {
  'Automation': 'Create health report for inboxes',
  'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
  'Run at': $now.toISO(),
  'Records In': totalInboxes,
  'Records Out': totalDomains,
  'Errors': failed.length,
  'Target': 'Domains',
  'Trigger': launch.trigger || 'schedule',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Duration s': Math.round(($now.toMillis() - (launch.startedAt || $now.toMillis())) / 1000),
  'Description': parts.join('\n'),
};
// Client is attached only when the run served exactly one client; never an empty link array.
if (launch.clientFilter) row['Client'] = [launch.clientFilter];
return [{ json: row }];
