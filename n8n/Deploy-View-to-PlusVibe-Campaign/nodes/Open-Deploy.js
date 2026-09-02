// Open Deploy: the door's one entry, and the only place it names itself. The webhook is now the
// ONLY way in (Operator ruling 2026-09-03): the daily feed lives in Airtable, as Schedule Live
// View Deploys, which creates the launch rows and fires this webhook, so the scheduled and the
// on-demand path are the same path by construction instead of by convention.
const b = ($input.first() || {}).json || {};
const recordId = String((b.body && b.body.recordId) || (b.query && b.query.recordId) || b.recordId || '').trim();
return [{ json: {
  mode: 'prepare',
  sender: 'PlusVibe',
  automation: 'Deploy View to PlusVibe Campaign',
  execId: String($execution.id),
  wfId: String($workflow.id),
  recordId: recordId || 'recMISSING'
} }];
