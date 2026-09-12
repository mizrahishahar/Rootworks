// Decide: the standard, applied once over every campaign that carries a Stage.
// Reads only what the Hub already holds: the Campaigns rows the syncs wrote at 07:00, and the
// newest deploy row per campaign (Left in View, written by the deploy doors). Never a platform.
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

// Clients: id -> name
const clientName = {};
for (const j of items('Get Clients')) { const f = j.fields || j; clientName[j.id] = String(f['Client'] || j.id); }

// Newest deploy row per campaign id (Target on a scheduled launch row is the campaign id).
const newestDeploy = {};
for (const j of items('Get Deploy Rows')) {
  const f = j.fields || j;
  const target = String(f['Target'] || '').trim();
  if (!target) continue;
  const at = Date.parse(f['Run at'] || '') || 0;
  if (!newestDeploy[target] || at > newestDeploy[target].at) {
    const liv = f['Left in View'];
    newestDeploy[target] = { at, leftInView: (liv === undefined || liv === null || liv === '') ? null : num(liv), runAt: f['Run at'] || '' };
  }
}

// Campaigns with a Stage, scoped by the client filter on a launched run.
const camps = [];
for (const j of items('Get Campaigns')) {
  const f = j.fields || j;
  const clientIds = (Array.isArray(f['Client']) ? f['Client'] : []).map(c => (c && typeof c === 'object') ? String(c.id || '') : String(c || '')).filter(Boolean);
  if (cf && !clientIds.includes(cf)) continue;
  const stage = nm(f['Stage']);
  if (!stage || stage === 'Killed') continue;
  const channel = nm(f['Channel']);
  camps.push({
    rid: j.id,
    name: String(f['Campaign'] || j.id),
    campaignId: String(f['Campaign ID'] || '').trim(),
    sender: nm(f['Sequencer']) || '?',
    lane: channel === 'Email' ? 'Email' : 'LinkedIn',
    status: nm(f['Status']),
    stage,
    leads: num(f['Leads']),
    contacted: num(f['Contacted']),
    positives: num(f['Positive Replies (PV)']),
    liveView: String(f['Live View ID'] || '').trim(),
    clientId: clientIds[0] || '',
    lastSent: f['Last Sent'] || '',
  });
}
sd.scope = cf ? (camps.length ? 'one client (on demand)' : 'client filter matched no managed campaign') : 'all clients';
sd.managed = camps.length;

// Shared views: two in-play campaigns drinking from one Live View ID.
const inPlay = c => STANDARD.inPlayStages.includes(c.stage) && !STANDARD.notInPlayStatus.includes(c.status);
const viewUse = {};
for (const c of camps) if (inPlay(c) && c.liveView) viewUse[c.liveView] = (viewUse[c.liveView] || 0) + 1;

const byClient = {};
const updates = [];
for (const c of camps) {
  const key = c.clientId || '(no client)';
  const R = byClient[key] || (byClient[key] = { clientRecId: c.clientId, client: clientName[c.clientId] || (c.clientId ? c.clientId : '(no client)'), testProgress: [], testReady: [], scaleProgress: [], scaleReady: [], run: [], paused: [], moved: [], failed: [] });
  c.perPositive = c.positives ? Math.round(c.contacted / c.positives) : null;
  c.tags = [];
  if (!inPlay(c)) {
    if (c.status === 'PAUSED') R.paused.push(c);
    continue;
  }
  if (!c.liveView) c.tags.push('NO VIEW');
  else if (viewUse[c.liveView] > 1) c.tags.push('SHARED VIEW');
  const d = c.campaignId ? newestDeploy[c.campaignId] : null;
  if (d && d.leftInView === 0) c.tags.push('DRY since ' + String(d.runAt).slice(0, 10));
  if (c.lane === 'LinkedIn') c.tags.push('LINKEDIN');
  const need = STANDARD.positives[c.lane];
  if (c.stage === 'Test') {
    if (c.contacted >= STANDARD.line.Test) {
      if (c.positives >= need) { c.verdict = 'moved to Scale'; updates.push({ id: c.rid, Stage: 'Scale', name: c.name, client: R.client }); }
      else { c.verdict = 'killed'; updates.push({ id: c.rid, Stage: 'Killed', name: c.name, client: R.client }); }
      R.testReady.push(c); R.moved.push(c);
    } else R.testProgress.push(c);
  } else if (c.stage === 'Scale') {
    if (c.contacted >= STANDARD.line.Scale) R.scaleReady.push(c); else R.scaleProgress.push(c);
  } else R.run.push(c);
}
for (const k of Object.keys(byClient)) byClient[k].scaleReady.sort((a, b) => (a.perPositive || 1e9) - (b.perPositive || 1e9));
sd.results = Object.keys(byClient).map(k => byClient[k]).sort((a, b) => a.client.localeCompare(b.client));
sd.updates = updates;
sd.standard = STANDARD;
if (!updates.length) return [{ json: { _none: true } }];
return updates.map(u => ({ json: { id: u.id, Stage: u.Stage } }));
