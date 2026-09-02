// Init Deploy: the launch row into the run's state. One launch = one view into one campaign:
// Client link, Table (People or Companies, by name, required), View (id or exact name, required),
// Target (the sequencer's campaign id), Dedupe Mode (PlusVibe only), Max Rows.
// No defaults (Operator ruling 2026-09-02): a launch row that leaves Table or View blank is
// refused here, before anything is read or sent.
// Max Rows is optional and blank means unlimited: the most rows this run may enrol, applied in
// Build Rows to the rows that survive every other check. The Airtable feed sets it per sequencer;
// a hand-launched deploy leaves it blank unless the Operator wants a slice.
// The launch row is read from Read Launch Row by name, never from $input: Stamp Running sits
// between them and hands on its own item (or its error item, when there is no row to stamp).
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const call = $('Route Mode').first().json;
let r = {}; try { r = ($('Read Launch Row').first() || {}).json || {}; } catch (e) {}
const f = r.fields || r;
const cid = Array.isArray(f['Client']) ? f['Client'][0] : null;
const isPV = call.sender === 'PlusVibe';
const D = {
  sender: call.sender, automation: String(call.automation || ''),
  execId: String(call.execId), wfId: String(call.wfId || ''),
  launchId: String(r.id || ''),
  clientId: (cid && typeof cid === 'object') ? String(cid.id || '') : String(cid || ''),
  table: String((f['Table'] && f['Table'].name) || f['Table'] || '').trim(), tableId: '', tableName: '',
  view: String(f['View'] || '').trim(), viewId: '', viewType: '',
  target: String(f['Target'] || '').trim(),
  dedupe: String((f['Dedupe Mode'] && f['Dedupe Mode'].name) || f['Dedupe Mode'] || 'Strict').trim() || 'Strict',
  maxRows: Math.max(0, Math.floor(Number(f['Max Rows']) || 0)),
  // The launch row's own Trigger is kept and written back unchanged: the Airtable feed stamps
  // "schedule" on the rows it creates, and a hand launch is "form". The door never overrides it.
  trigger: String((f['Trigger'] && f['Trigger'].name) || f['Trigger'] || '').trim() || 'form',
  clientName: '', ws: '', crBase: '', share: '', regTableId: '',
  campName: '', hubCampaignRid: '', pullInUrl: '',
  dncTableId: '', mirrorTableId: '', stampMirrorRid: '', shareViewLink: '', hasDeployError: false,
  linkedinCol: '', plan: { varCols: [], rideCols: [] }, requiredCore: [], needFirstName: true,
  rows: {}, varMisses: {}, skipCounts: {}, rowsTotal: 0,
  emailToRow: {}, urlToRow: {}, inCamp: {}, freshProspects: {},
  uploadedNew: 0, deployed: 0, landed: 0, pushed: 0, missing: 0, campsStamped: 0,
  pausedTitle: 0, pausedUrl: 0, pausedNoData: 0, pausedNames: [], campaignProspects: 0,
  rbFailed: false, ready: false,
  errors: [], warnings: [], abort: null,
  startedAt: Date.now(), runAt: $now.toISO()
};
if (!D.launchId) { D.abort = 'launch row not found'; D.errors.push('launch row not found (recordId missing or invalid)'); }
// Stamp Running never gates, so a real Airtable failure there would be silent. It is not: a launch
// row that exists but could not be claimed leaves finish upserting a NEW row on this execution id
// instead of closing the launch row, and that has to be readable on the row it does write.
if (D.launchId) {
  try { const s = ($('Stamp Running').first() || {}).json || {}; if (s.error) D.errors.push('could not stamp the launch row Running: ' + JSON.stringify(s.error).slice(0, 200) + '; this run logs to a new row instead of closing the launch row'); } catch (e) {}
}
if (!D.abort && !D.clientId) { D.abort = 'no client link'; D.errors.push('launch row has no Client link'); }
if (!D.abort && !D.table) { D.abort = 'no Table'; D.errors.push('launch row has no Table (People or Companies); nothing was sent'); }
if (!D.abort && !D.view) { D.abort = 'no View'; D.errors.push('launch row has no View; nothing was sent'); }
if (!D.abort) {
  const ok = isPV ? /^[0-9a-f]{24}$/i.test(D.target) : /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(D.target);
  if (!ok) { D.abort = 'invalid Target'; D.errors.push('Target "' + D.target + '" is not ' + (isPV ? 'a plausible PlusVibe campaign id (24 hex)' : 'an Alta campaign UUID')); }
}
sd[dk] = D;
return [{ json: { clientId: D.clientId || 'recMISSING' } }];
