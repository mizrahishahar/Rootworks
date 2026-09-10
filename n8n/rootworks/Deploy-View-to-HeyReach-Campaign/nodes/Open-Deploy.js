// Open Deploy: the door's one entry, and the only place it names itself. The webhook is the ONLY
// way in (Operator ruling 2026-09-03): Schedule Live View Deploys creates the launch row and fires
// this webhook, so a scheduled deploy and a hand launch are the same run.
// HeyReach is resolved through the registry (Operator ruling 2026-09-08): the client's HeyReach API
// Key rides in the state the shared machine returns and is put on the X-API-KEY header of every
// HeyReach call by expression; no credential, no hardcoded workspace.
const b = ($input.first() || {}).json || {};
const recordId = String((b.body && b.body.recordId) || (b.query && b.query.recordId) || b.recordId || '').trim();
return [{ json: {
  mode: 'prepare',
  sender: 'HeyReach',
  automation: 'Deploy View to HeyReach Campaign',
  execId: String($execution.id),
  wfId: String($workflow.id),
  recordId: recordId || 'recMISSING'
} }];
