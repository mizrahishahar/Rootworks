// One row per run, per the logging standard: computed Status, failed[] -> Errors,
// skips separated, Client attached only when the run serves exactly one client.
const P = $('Params').first().json;
const F = $('Finalize').first().json;
const res = F.result || {};
const acc = F.acc || { tried: [], skipped: [], failed: [] };
const failed = (acc.failed || []).slice();
if (F._invalid) failed.push('invalid payload: ' + (F._error || 'unknown'));
let wrote = false;
try { const w = $('Write Row').first().json; if (w && w.id) wrote = true; } catch (e) {}
if (F._writeback && !wrote) failed.push('writeback did not land on ' + (F.recordId || 'row'));
const start = P.startedAt || new Date().toISOString();
const ms = Date.parse(start);
const dur = ms ? Math.round((Date.now() - ms) / 1000) : null;
const target = (F.person && F.person.email) || P.recordId || 'unknown';
const found = !!res.phone;
const lines = [
  '**' + target + ' · ' + (found ? res.phone + ' (' + res.phone_source + ')' : 'no phone found') + '**',
  '',
  '- **Contact:** ' + P.recordId,
  '- **Tiers tried:** ' + ((acc.tried || []).join(', ') || 'none'),
  '- **Result:** ' + (found ? res.phone + ' via ' + res.phone_source : 'none') + (F._writeback ? (wrote ? ' · written to row' : ' · WRITEBACK FAILED') : ''),
];
if ((acc.skipped || []).length) lines.push('', '**Skipped (' + acc.skipped.length + ')**', ...acc.skipped.map((x) => '- ' + x));
if (failed.length) lines.push('', '**FAILED (' + failed.length + ')**', ...failed.map((x) => '- ' + x));
const row = {
  'Automation': 'Waterfall Phones',
  'Run at': start,
  'Records In': 1,
  'Records Out': found ? 1 : 0,
  'Target': target,
  'Trigger': 'webhook',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Duration s': dur,
  'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
  'Errors': failed.length,
  'Description': lines.join('\n'),
};
if (P.clientRecordId) row['Client'] = [P.clientRecordId];
return [{ json: row }];
