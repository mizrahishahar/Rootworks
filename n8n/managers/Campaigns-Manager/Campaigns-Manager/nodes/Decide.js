// Decide: the standard, applied once over every campaign that carries a Stage.
// Reads only what the Hub already holds: the Campaigns rows, which the syncs wrote at night and the
// deploy doors stamp with Left in View and Last Fed; and the syncs' own run rows, to know the
// numbers are fresh. Never a platform.
// Writes nothing here: it plans the Stage moves (Test to Scale, Test to Killed, never Run) and
// the per-client report blocks into static data; Update Stage and Build Messages consume them.
// The numbers below are the card's standard block (managers/Campaigns-Manager/card.json); a change
// there is a change here, in the same commit.
const STANDARD = {
  stageTotal: { Test: 1000, Scale: 3000, Run: null },
  line: { Test: 1000, Scale: 3000 },
  positives: { Email: 1, LinkedIn: 3 },
  inPlayStages: ['Test', 'Scale', 'Run'],
  notInPlayStatus: ['PAUSED', 'DRAFT', 'STOPPED'],
};
const sd = $getWorkflowStaticData('global');
const launch = sd.launch || {};
const cf = String(launch.clientFilter || '');
const nm = v => (v && typeof v === 'object') ? String(v.name || '') : String(v || '');
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const items = name => { try { return $(name).all().map(i => i.json).filter(j => j && j.id); } catch (e) { return []; } };

// Clients: id -> name, and the PlusVibe workspace the Run series is read from.
const clientName = {}; const clientWs = {};
for (const j of items('Get Clients')) { const f = j.fields || j; clientName[j.id] = String(f['Client'] || j.id); clientWs[j.id] = String(f['PlusVibe Workspace ID'] || '').trim(); }

// The syncs are the manager's eyes. Each of the three must have finished within the last day,
// Succeeded or Succeeded with errors; a sync that failed or never ran means the numbers are stale,
// and the whole run stops here: no Stage move, no feed, one message saying why. A Failed run row
// is the record.
const SYNCS = ['Sync PlusVibe Campaigns to Hub', 'Sync Alta Campaigns to Hub', 'Sync Email Bison Campaigns to Hub'];
const OK_STATUS = ['Succeeded', 'Succeeded with errors', 'Success'];
const fresh = {};
for (const j of items('Get Sync Runs')) {
  const f = j.fields || j;
  const name = nm(f['Automation']); const at = Date.parse(f['Run at'] || '') || 0;
  if (!SYNCS.includes(name) || Date.now() - at > 26 * 3600 * 1000) continue;
  if (OK_STATUS.includes(nm(f['Status']))) fresh[name] = true;
}
const staleSyncs = SYNCS.filter(s => !fresh[s]);
sd.abort = staleSyncs.length ? ('the numbers are stale: no successful run in the last 26 hours for ' + staleSyncs.join(', ')) : '';
if (sd.abort) { sd.failed.push(sd.abort); sd.results = []; sd.updates = []; sd.managed = 0; sd.unmanaged = 0; sd.scope = 'aborted'; return [{ json: { _none: true } }]; }

// Every campaign that is not DRAFT or STOPPED, scoped by the client filter on a launched run.
// A campaign with a Stage is managed; Killed is out of the report; a campaign without a Stage is
// unmanaged and shown as such, so the board is complete and every gap is one decision away.
const camps = []; const unmanaged = [];
for (const j of items('Get Campaigns')) {
  const f = j.fields || j;
  const clientIds = (Array.isArray(f['Client']) ? f['Client'] : []).map(c => (c && typeof c === 'object') ? String(c.id || '') : String(c || '')).filter(Boolean);
  if (cf && !clientIds.includes(cf)) continue;
  const stage = nm(f['Stage']);
  if (stage === 'Killed') continue;
  const channel = nm(f['Channel']);
  const c = {
    rid: j.id,
    name: String(f['Campaign'] || j.id),
    campaignId: String(f['Campaign ID'] || '').trim(),
    sender: nm(f['Sequencer']) || '?',
    lane: channel === 'Email' ? 'Email' : 'LinkedIn',
    status: nm(f['Status']),
    stage,
    table: nm(f['Table']) || 'People',
    leads: num(f['Leads']),
    contacted: num(f['Contacted']),
    positives: num(f['Positive Replies (PV)']),
    liveView: String(f['Live View ID'] || '').trim(),
    clientId: clientIds[0] || '',
    lastSent: f['Last Sent'] || '',
    // Feeding state, written on this row by the deploy door at the end of every run.
    leftInView: (f['Left in View'] === undefined || f['Left in View'] === null || f['Left in View'] === '') ? null : num(f['Left in View']),
    lastFed: f['Last Fed'] || '',
  };
  // Without a Stage every campaign that ever sent is a decision, COMPLETED included: a finished one
  // may still want another run, and finished-for-good is spelled Killed, not blank.
  if (stage) camps.push(c); else if (c.clientId) unmanaged.push(c);
}
sd.scope = cf ? ((camps.length || unmanaged.length) ? 'one client (on demand)' : 'client filter matched no campaign') : 'all clients';
sd.managed = camps.length;
sd.unmanaged = unmanaged.length;

// Shared views: two in-play campaigns drinking from one Live View ID.
const inPlay = c => STANDARD.inPlayStages.includes(c.stage) && !STANDARD.notInPlayStatus.includes(c.status);
const viewUse = {};
for (const c of camps) if (inPlay(c) && c.liveView) viewUse[c.liveView] = (viewUse[c.liveView] || 0) + 1;

const byClient = {};
const updates = [];
const bucket = c => { const key = c.clientId || '(no client)'; return byClient[key] || (byClient[key] = { clientRecId: c.clientId, client: clientName[c.clientId] || (c.clientId ? c.clientId : '(no client)'), pvWorkspace: clientWs[c.clientId] || '', testProgress: [], testReady: [], scaleProgress: [], scaleReady: [], run: [], paused: [], unmanaged: [], fed: [], moved: [], failed: [] }); };
for (const c of unmanaged) { c.perPositive = c.positives ? Math.round(c.contacted / c.positives) : null; c.tags = []; bucket(c).unmanaged.push(c); }
for (const c of camps) {
  const R = bucket(c);
  c.perPositive = c.positives ? Math.round(c.contacted / c.positives) : null;
  c.tags = [];
  if (!inPlay(c)) {
    if (c.status === 'PAUSED') R.paused.push(c);
    continue;
  }
  if (!c.liveView) c.tags.push('NO VIEW');
  else if (viewUse[c.liveView] > 1) c.tags.push('SHARED VIEW');
  if (c.leftInView === 0) c.tags.push('DRY since ' + String(c.lastFed).slice(0, 10));
  if (c.lane === 'LinkedIn') c.tags.push('LINKEDIN');
  const need = STANDARD.positives[c.lane];
  // At the line: the stage total contacted, or the stage total held and the sender finished with it.
  // Status is the Hub's own vocabulary, every sync maps its sender into it, so this reads no platform.
  const atLine = stage => c.contacted >= STANDARD.line[stage] || (c.leads >= STANDARD.stageTotal[stage] && c.status === 'COMPLETED');
  if (c.stage === 'Test') {
    if (atLine('Test')) {
      if (c.positives >= need) { c.verdict = 'moved to Scale'; updates.push({ id: c.rid, Stage: 'Scale', name: c.name, client: R.client }); }
      else { c.verdict = 'killed'; updates.push({ id: c.rid, Stage: 'Killed', name: c.name, client: R.client }); }
      R.testReady.push(c); R.moved.push(c);
    } else R.testProgress.push(c);
  } else if (c.stage === 'Scale') {
    if (atLine('Scale')) R.scaleReady.push(c); else R.scaleProgress.push(c);
  } else R.run.push(c);
}
for (const k of Object.keys(byClient)) byClient[k].scaleReady.sort((a, b) => (a.perPositive || 1e9) - (b.perPositive || 1e9));
sd.results = Object.keys(byClient).map(k => byClient[k]).sort((a, b) => a.client.localeCompare(b.client));
sd.updates = updates;
sd.standard = STANDARD;
if (!updates.length) return [{ json: { _none: true } }];
return updates.map(u => ({ json: { id: u.id, Stage: u.Stage } }));
