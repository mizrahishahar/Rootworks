// Build Send Log: one Hub Automations row per send, written before the door answers. Every message
// this door puts on LinkedIn is on the record with who it went to, what it said and whether Alta took
// it (Operator ruling 2026-09-19). Reads and refusals are not logged; only the sends.
const a = $input.first().json || {};
const r = $('Alta Token Gate').first().json || {};
const body = String(r.body || '');
const preview = body.length > 500 ? body.slice(0, 500) + ' [...]' : body;
const ok = a.ok !== false;
const desc = [
  '**LinkedIn reply sent through the door**',
  '',
  '- **Prospect:** ' + (r.prospectId || ''),
  '- **Campaign:** ' + (r.campaignId || 'not given'),
  '- **Rep:** ' + (r.repId || 'resolved by Alta'),
  '- **Chars:** ' + body.length + ' of 2000',
  '- **Alta:** ' + (ok ? 'accepted the send' : 'refused: ' + String(a.error || '') + ' ' + String(a.detail || '').slice(0, 300)),
  '',
  '**THE MESSAGE**',
  '',
  preview,
].join('\n');
return [{ json: {
  Automation: 'Alta LinkedIn Door',
  Status: ok ? 'Succeeded' : 'Failed',
  Errors: ok ? 0 : 1,
  'Run at': new Date().toISOString(),
  'Records In': 1,
  'Records Out': ok ? 1 : 0,
  Target: r.prospectId || '',
  Trigger: 'event',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  Description: desc,
} }];
