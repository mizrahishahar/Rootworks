// Open Deploy: the door's one entry, and the only place it names itself. The webhook is the ONLY
// way in (Operator ruling 2026-09-03): Schedule Live View Deploys creates the launch row and fires
// this webhook, so a scheduled deploy and a hand launch are the same run.
// Email Bison is hardcoded to DuoDiv's instance (Operator ruling 2026-09-06): the base URL sits on
// the HTTP nodes and the token on their credential; no registry field names either.
const b = ($input.first() || {}).json || {};
const recordId = String((b.body && b.body.recordId) || (b.query && b.query.recordId) || b.recordId || '').trim();
return [{ json: {
  mode: 'prepare',
  sender: 'Email Bison',
  automation: 'Deploy View to Email Bison Campaign',
  execId: String($execution.id),
  wfId: String($workflow.id),
  recordId: recordId || 'recMISSING'
} }];
