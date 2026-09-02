// Build Run Log: the run's one Hub row, upserted on the CALLER's Execution ID, which is the launch
// row Stamp Running already claimed. One row per run, never two (the Alta lane used to create a
// second row beside the launch row it also updated).
// Status is computed, never a literal, and each lane keeps the verdict it was given: PlusVibe
// reads Succeeded unless something failed; Alta calls a refusal Failed and counts an auto-pause
// as an error. The Description is the narrative a human reads at a glance, and the duplicate
// count in it is a MIRROR, never a gate: the view owns dedupe, and this line is how a view that
// stopped excluding what it already sent shows up on day one instead of quietly spending the
// whole daily allowance re-offering the same people.
// Only the row's real fields are returned: the write maps input straight onto the table.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const D = sd[dk] || { errors: ['deploy state missing'], warnings: [], rows: {}, skipCounts: {}, launchId: '', sender: 'PlusVibe', automation: '', execId: String($execution.id), wfId: '' };
const isPV = D.sender === 'PlusVibe';
try { const r = ($('Create Lead List').first() || {}).json || {}; if (!r.id && !D.abort) D.warnings.push('Lead Lists receipt creation failed'); } catch (e) { if (!D.abort) D.warnings.push('Lead Lists receipt not created'); }
const fmt = v => Number(v || 0).toLocaleString('en-US');
const failed = (D.errors || []).slice();
const sc = D.skipCounts || {};
const skipTotal = Object.keys(sc).reduce((s, k) => s + sc[k], 0);
const md = [];
if (isPV) {
  md.push('**Deployed ' + fmt(D.deployed || 0) + ' of ' + fmt(D.rowsTotal || 0) + ' view rows to ' + (D.campName || '?') + '**');
  md.push('');
  md.push('**Campaign:** ' + (D.campName || '?') + ' (' + (D.target || '?') + ')');
  md.push('**Table:** ' + (D.tableName || D.table || '?') + ' (' + (D.tableId || '?') + ')');
  md.push('**View:** ' + (D.view || '?'));
  if (D.viewLink) md.push('**Link:** ' + D.viewLink);
  md.push('**Dedupe mode:** ' + (D.dedupe || 'Strict'));
  if (D.campsStamped) md.push('**Campaigns links stamped:** ' + fmt(D.campsStamped) + ' (this list = filter Campaigns has the campaign)');
  const P = D.pv;
  if (P) {
    md.push('');
    md.push('**Sent to PlusVibe**');
    md.push('- Sent: ' + fmt(P.sent));
    md.push('- Accepted: ' + fmt(P.uploaded));
    md.push('- Not accepted: ' + fmt((P.sent || 0) - (P.uploaded || 0)));
    if (P.skipped) md.push('   - Already in the workspace, blocked by dedupe mode "' + (D.dedupe || 'Strict') + '": ' + fmt(P.skipped));
    if (P.already) md.push('   - Already in this campaign: ' + fmt(P.already));
    if (P.duplicate) md.push('   - Same email twice in the upload: ' + fmt(P.duplicate));
    if (P.invalid) md.push('   - PlusVibe judged the email invalid: ' + fmt(P.invalid));
    if (P.overflowed) md.push('   - Over your plan limit: ' + fmt(P.overflowed));
    if (P.overwritten) md.push('   - Existing lead refreshed instead of added: ' + fmt(P.overwritten));
    if (P.remaining !== null && P.remaining !== undefined) md.push('- Leads left in plan: ' + fmt(P.remaining));
  }
  const alreadyStamped = sc['already in campaign (Campaigns stamp)'] || 0;
  const pvDupes = (P ? Number(P.skipped || 0) + Number(P.already || 0) : 0);
  md.push('');
  md.push('**Already present: ' + fmt(pvDupes + alreadyStamped) + '** (PlusVibe: in this campaign ' + fmt(P ? P.already : 0) + ', in the workspace ' + fmt(P ? P.skipped : 0) + ' · Campaigns stamp, caught before sending: ' + fmt(alreadyStamped) + ')');
  if (D.missing) { md.push(''); md.push('- Sent but not found in the campaign afterwards: ' + fmt(D.missing)); }
  const vm = D.varMisses || {};
  const vmKeys = Object.keys(vm).sort((a, b) => vm[b] - vm[a]);
  if (vmKeys.length) {
    md.push('');
    md.push('**Not sent: a required column was empty**');
    md.push('These rows never left Airtable. Fill the column or hide it from the view.');
    for (const k of vmKeys) md.push('- ' + k + ' was empty on ' + fmt(vm[k]) + ' row' + (vm[k] === 1 ? '' : 's'));
  }
  if (skipTotal) {
    md.push('');
    md.push('**Not sent: other reasons (' + fmt(skipTotal) + ')**');
    for (const k of Object.keys(sc)) md.push('- ' + k + ': ' + fmt(sc[k]));
  }
  if (D.receiptName) { md.push(''); md.push('**Lead list receipt:** ' + D.receiptName); }
} else {
  md.push('**Landed ' + fmt(D.landed) + ' of ' + fmt(D.rowsTotal) + ' view rows in ' + (D.campName || D.target || '?') + '**');
  md.push('');
  md.push('**Campaign:** ' + (D.campName || '?') + ' (' + (D.target || '?') + ') · **View:** ' + (D.view || '?') + ' on ' + (D.tableName || D.table || '?') + ' (' + (D.tableId || '?') + ')');
  md.push('');
  md.push('**Funnel**');
  md.push('- **View rows:** ' + fmt(D.rowsTotal));
  if (skipTotal) { md.push('- **Skipped before push (' + fmt(skipTotal) + '):**'); for (const k of Object.keys(sc)) md.push('   - ' + k + ': ' + fmt(sc[k])); }
  md.push('- **Pushed:** ' + fmt(D.pushed));
  md.push('- **Landed (readback):** ' + fmt(D.landed));
  if (D.missing) md.push('- **Pushed but not in the campaign:** ' + fmt(D.missing));
  const pz = (D.pausedTitle || 0) + (D.pausedUrl || 0) + (D.pausedNoData || 0);
  if (pz) { md.push('- **Auto-paused after landing:** ' + fmt(pz) + ' (title rule ' + fmt(D.pausedTitle) + ' · URL mismatch ' + fmt(D.pausedUrl) + ' · no person data ' + fmt(D.pausedNoData) + ')'); for (const n of (D.pausedNames || [])) md.push('   - ' + n); }
  md.push('- **Campaigns links stamped:** ' + fmt(D.campsStamped));
  // Alta's pull-in NEVER reports a duplicate: it answers 200 {"message":"Prospect uploaded
  // successfully"} whether the person is new or already a member. So the count is what we can see
  // by values: rows the Campaigns stamp caught before pushing, plus rows the readback found
  // already in the campaign from before this run started, which is Alta silently absorbing a push.
  const stampDupes = sc['already in campaign (Campaigns stamp)'] || 0;
  let healed = 0; for (const id of Object.keys(D.rows || {})) if (D.rows[id] && D.rows[id].healed) healed++;
  md.push('- **Already present:** ' + fmt(stampDupes + healed) + ' (Campaigns stamp, caught before pushing ' + fmt(stampDupes) + ' · pushed but already a member before this run ' + fmt(healed) + '). Alta never reports a duplicate itself.');
  if (D.receiptName) { md.push(''); md.push('**Lead list receipt:** ' + D.receiptName); }
}
if ((D.warnings || []).length) { md.push(''); md.push('**Warnings (' + D.warnings.length + ')**'); for (const w of D.warnings) md.push('- ' + w); }
if (failed.length) { md.push(''); md.push('**FAILED (' + failed.length + ')**'); for (const e of failed) md.push('- ' + e); }
const pz = (D.pausedTitle || 0) + (D.pausedUrl || 0) + (D.pausedNoData || 0);
const status = isPV
  ? (failed.length ? 'Succeeded with errors' : 'Succeeded')
  : (D.abort ? 'Failed' : ((failed.length || pz || D.missing) ? 'Succeeded with errors' : 'Succeeded'));
const errors = isPV ? failed.length : (failed.length + (pz ? 1 : 0));
const durS = Math.round((Date.now() - (D.startedAt || Date.now())) / 1000);
D.finalStatus = status;
D.finalDescription = md.join('\n');
const row = {
  'Status': status,
  'Trigger': D.trigger || 'form',
  'Run at': D.runAt || new Date().toISOString(),
  'Duration s': durS,
  'Records In': D.rowsTotal || 0,
  'Records Out': (isPV ? (D.deployed || 0) : (D.landed || 0)),
  'Errors': errors,
  'Execution ID': String(D.execId || $execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + (D.wfId || $workflow.id) + '/executions/' + String(D.execId || $execution.id),
  'Description': D.finalDescription.slice(0, 95000)
};
// On a launch row, Automation and Target are LAUNCH PARAMETERS the feed or the Operator wrote, and
// the upsert must not overwrite them: Target holds the campaign id this run was told to deploy
// into, and a run that rewrote it as a description destroyed the record of what it was asked to do
// (caught live, 2026-09-03). Only a run with no launch row of its own fills them in.
if (!D.launchId) {
  row['Automation'] = D.automation || '';
  row['Target'] = (D.tableName || D.table || '') + ' (' + (D.tableId || '') + ') -> ' + (D.campName || D.target || '');
}
return [{ json: row }];
