// Schedule Live View Deploys, the Airtable automation (wfl2KS21P7LFkpwfE), daily 13:30 Asia/Jerusalem.
// This file is the source of that script; Airtable's API cannot update a script step, so a change here
// is pasted into the automation by the Operator, then this file is the record of what runs.
//
// The deploy schedule lives in Airtable, not in n8n, so each n8n door keeps exactly one entry point.
// It creates one launch row per campaign IN PLAY (Stage Test, Scale or Run; a Live View ID; platform
// status not PAUSED, DRAFT or STOPPED, so COMPLETED stays in), with Status left EMPTY so the launch
// door fires it. It writes NO Max Rows: the deploy helper caps the run itself from the campaign's Stage
// (Test holds 1,000, Scale 3,000, Run the sender's daily cap; Campaigns Manager standard, 2026-09-12).
// Always writes a heartbeat row, even when nothing qualifies, because an Airtable automation fails quietly.
const C = {
  name: 'fldFFwUZM2EmH5DZf', campaignId: 'fldMTy0FVY7GvD6BY', sequencer: 'fldiDh8kyaOhcDM0t',
  status: 'fld9NY8nCEV19lQwX', client: 'fldWg9V9OtFDeoB9O', table: 'fldr4Ua9qSm20qGMr',
  liveView: 'fldj1RB3PRR8Cb76m', stage: 'fldOEzL4gFsv847yo'
};
const A = {
  automation: 'fldRe2vzcg1UqYlVk', client: 'fldEAmAdxzBKeEyqy', table: 'fldyIUpTgDWC7uAHN',
  view: 'fldWh9IcTtPUHf57B', target: 'fldauHlDgfpJVElqI', dedupe: 'fld8G246L8qk8XQhv',
  status: 'fldD4aa7LKaGX2Hkk', errors: 'fldmnHtnKmHpne5r4', trigger: 'fldA0SJ7j8J5GbTzK',
  description: 'fldkjN9bBmIIRFXe7'
};
const PLAN = {
  'PlusVibe': { automation: 'Deploy View to PlusVibe Campaign', dedupe: 'Active-only' },
  'Alta': { automation: 'Deploy View to Alta Campaign' },
  'Email Bison': { automation: 'Deploy View to Email Bison Campaign' }
};
const IN_PLAY = ['Test', 'Scale', 'Run'];
const NOT_IN_PLAY = ['PAUSED', 'DRAFT', 'STOPPED'];

let campaigns = base.getTable('tblbVPakE4n16ob7Y');
let automations = base.getTable('tbli7rV6Qf3sLpV6R');

let found = 0;
let created = {};
for (let k of Object.keys(PLAN)) created[k] = 0;
let skipped = [];
let failed = [];
let fatal = '';

try {
  let q = await campaigns.selectRecordsAsync({ fields: Object.values(C) });
  let rows = [];
  for (let r of q.records) {
    let stage = r.getCellValue(C.stage);
    if (!stage || IN_PLAY.indexOf(stage.name) < 0) continue;
    let view = (r.getCellValue(C.liveView) || '').trim();
    let label = r.getCellValue(C.name) || r.id;
    if (!view) { skipped.push(label + ' - Stage ' + stage.name + ' but no Live View ID'); continue; }
    let st = r.getCellValue(C.status);
    if (st && NOT_IN_PLAY.indexOf(st.name) >= 0) { skipped.push(label + ' - ' + st.name + ' on the platform'); continue; }
    found++;
    let seq = r.getCellValue(C.sequencer);
    let seqName = seq ? seq.name : '(none)';
    let plan = PLAN[seqName];
    if (!plan) { skipped.push(label + ' - sequencer ' + seqName + ' has no deploy machine'); continue; }
    let target = (r.getCellValue(C.campaignId) || '').trim();
    if (!target) { skipped.push(label + ' - no Campaign ID'); continue; }
    let tbl = r.getCellValue(C.table);
    let f = {};
    f[A.automation] = { name: plan.automation };
    f[A.table] = { name: tbl ? tbl.name : 'People' };
    f[A.view] = view;
    f[A.target] = target;
    if (plan.dedupe) f[A.dedupe] = { name: plan.dedupe };
    f[A.trigger] = { name: 'schedule' };
    let cl = r.getCellValue(C.client);
    if (cl && cl.length) f[A.client] = cl.map(l => ({ id: l.id }));
    rows.push({ fields: f, seq: seqName, label: label });
  }
  for (let i = 0; i < rows.length; i += 40) {
    let batch = rows.slice(i, i + 40);
    try {
      await automations.createRecordsAsync(batch.map(b => ({ fields: b.fields })));
      for (let b of batch) created[b.seq]++;
    } catch (e) {
      for (let b of batch) failed.push(b.label + ' - create failed: ' + e.message);
    }
  }
} catch (e) {
  fatal = e.message;
  failed.push('run aborted - ' + e.message);
}

let total = 0;
for (let k of Object.keys(created)) total += created[k];
let L = [];
L.push('**' + total + ' deploy rows created from ' + found + ' campaigns in play**');
L.push('');
L.push('**Scope:** all clients. Campaigns with Stage Test, Scale or Run, a Live View ID, and not PAUSED, DRAFT or STOPPED on the platform. Max Rows left blank: the deploy caps the run from the Stage.');
L.push('');
L.push('**Created**');
for (let k of Object.keys(PLAN)) L.push('- ' + k + ' (' + PLAN[k].automation + (PLAN[k].dedupe ? ', Dedupe Mode ' + PLAN[k].dedupe : '') + '): ' + created[k]);
L.push('');
if (skipped.length) {
  L.push('Skipped (' + skipped.length + '):');
  for (let s of skipped.slice(0, 25)) L.push('- ' + s);
  if (skipped.length > 25) L.push('- ...and ' + (skipped.length - 25) + ' more');
} else { L.push('Skipped (0)'); }
if (failed.length) {
  L.push('');
  L.push('**Errors (' + failed.length + ')**');
  for (let s of failed.slice(0, 25)) L.push('- ' + s);
  if (failed.length > 25) L.push('- ...and ' + (failed.length - 25) + ' more');
}
if (fatal) { L.push(''); L.push('**Run aborted:** ' + fatal); }

let hb = {};
hb[A.automation] = { name: 'Schedule Live View Deploys' };
hb[A.status] = { name: failed.length ? 'Succeeded with errors' : 'Succeeded' };
hb[A.errors] = failed.length;
hb[A.trigger] = { name: 'schedule' };
hb[A.description] = L.join('\n');
await automations.createRecordAsync(hb);
