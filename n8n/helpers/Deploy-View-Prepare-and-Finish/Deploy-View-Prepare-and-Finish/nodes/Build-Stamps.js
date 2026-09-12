// Build Stamps: the source rows get the truth of this run written back onto them. Confirmed
// members get this campaign's mirror row unioned into their Campaigns links, never a replacement;
// everything else gets its reason in Deploy Error. That stamp is the door's own dedupe for every
// future run, which is why it is written even when nothing was sent.
// The state arrives as data from the caller and is put on this machine's static data for the rest
// of the finish lane; Build Run Log deletes the slot when it closes the row.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const call = $('Route Mode').first().json;
const D = call.state;
sd[dk] = D;
// isPV is the EMAIL lane: Email Bison confirms membership by read-back into inCamp exactly as PlusVibe does.
const isPV = D.sender === 'PlusVibe' || D.sender === 'Email Bison';
if (D.abort) { D.campsStamped = 0; return [{ json: { _none: true } }]; }
const patches = [];
let deployed = 0, missing = 0, stamped = 0;
const missingIdx = [];
for (const rid of Object.keys(D.rows || {})) {
  const r = D.rows[rid];
  const fields = {};
  let member = false;
  if (isPV) {
    let v = '';
    if (r.skip) v = r.skip;
    else if (D.rbFailed) continue;
    else if (r.email && D.inCamp[r.email]) { v = ''; deployed++; member = true; }
    else { v = 'not in campaign after deploy (dedupe-skipped or PV-dropped)'; missing++; missingIdx.push(patches.length); }
    fields['Deploy Error'] = v;
  } else {
    if (D.hasDeployError) fields['Deploy Error'] = r.skip || '';
    member = !!r.landed;
  }
  if (member && D.stampMirrorRid) {
    const set = {}; for (const c of (r.camps || [])) set[c] = 1; set[D.stampMirrorRid] = 1;
    fields['Campaigns'] = Object.keys(set); stamped++;
  }
  if (Object.keys(fields).length) patches.push({ id: rid, fields });
}
if (isPV) {
  // PlusVibe reports dedupe blocks as counts only, never per email. When every sent-but-absent row
  // is accounted for by those counts, all of them were dedupe and the stamp can say so; any
  // mismatch keeps the honest combined wording, because a chunk failure also lands rows here.
  const dedupeTotal = D.pv ? (Number(D.pv.skipped || 0) + Number(D.pv.already || 0)) : 0;
  if (missing > 0 && missing === dedupeTotal) {
    const lbl = 'blocked by dedupe mode "' + (D.dedupe || 'Strict') + '" (already in the workspace or campaign)';
    for (const i of missingIdx) patches[i].fields['Deploy Error'] = lbl;
  }
  D.deployed = deployed; D.missing = missing;
  // Recomputed at the end, because a row can pick up a skip after the send (rejected by the
  // sequencer's validation, paused by a post-landing gate).
  const skipCounts = {};
  for (const id of Object.keys(D.rows || {})) { const s = D.rows[id].skip; if (s) { const key = s.indexOf('DNC:') === 0 ? 'DNC' : s; skipCounts[key] = (skipCounts[key] || 0) + 1; } }
  D.skipCounts = skipCounts;
  if (deployed && !stamped && !D.rbFailed) D.warnings.push('deployed leads were not stamped with a Campaigns link (no mirror row resolved)');
  D.inCamp = {}; D.emailToRow = {};
} else {
  if (D.landed && !stamped) D.warnings.push('landed prospects were not stamped with a Campaigns link (no mirror row)');
}
D.campsStamped = stamped;
const out = [];
for (let i = 0; i < patches.length; i += 10) out.push({ json: { crBase: D.crBase, tableId: D.tableId, body: { records: patches.slice(i, i + 10), typecast: true } } });
if (!out.length) return [{ json: { _none: true } }];
return out;
