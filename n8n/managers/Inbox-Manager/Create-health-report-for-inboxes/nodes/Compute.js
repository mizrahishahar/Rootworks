// Everything the report knows about one client, derived once: per-inbox drift, per-domain
// verdicts, the client's capacity rollup, the gateway re-derivation and the Slack block.
// One item per inbox goes out (Account ID + Drift, the only inbox field this machine owns);
// the whole bundle rides on the first item so nothing downstream recomputes anything.
const cw = $('Loop Over Clients').first().json;
const clientName = String(cw.clientName || '');
const clientRecId = String(cw.clientRecId || '');
const isPool = !!cw.isPool;
const num = (v) => { if (typeof v === 'number') return v; const n = parseFloat(v); return isNaN(n) ? 0 : n; };
const nowIL = $now.setZone('Asia/Jerusalem');
const today = nowIL.startOf('day');

// ---------- inputs ----------
const pages = $('List Email Accounts').all().map(i => i && i.json).filter(Boolean);
const accounts = [];
for (const p of pages) { if (Array.isArray(p.accounts)) accounts.push(...p.accounts); }

let tagItems = [];
try { tagItems = $('List Tags').all().map(i => i && i.json).filter(Boolean); } catch (e) {}
const tagName = {}; const tagId = {};
for (const t of tagItems) {
  if (!t || !t._id) continue;
  const n = String(t.name || t._id);
  tagName[String(t._id)] = n;
  tagId[n.toLowerCase()] = String(t._id);
}

let prep = [];
try { prep = $('Prep Stat Calls').all().map(i => i.json); } catch (e) {}
let statsRes = [];
try { statsRes = $('Account Stats').all().map(i => i && i.json); } catch (e) {}
const windows = (prep[0] && prep[0]._windows) || {};
const bySpan = {};
let statFailures = 0;
prep.forEach((p, i) => {
  if (p._none) return;
  const r = statsRes[i] || {};
  const h = r.header;
  if (!h) { statFailures++; return; }
  // total_reply_count is ALREADY the human count: PlusVibe reports OOO separately and
  // publishes both reply_rate and reply_rate_with_ooo. Measured live on rundaveio.com
  // 2026-09-06: 2 replies, 10 OOO, 399 contacted, reply_rate 0.5, reply_rate_with_ooo 3.
  // Subtracting the two produces negative reply counts and false "gone quiet" flags.
  bySpan[p.accountId + '|' + p.span] = { sent: num(h.total_sent_count), human: num(h.total_reply_count), ooo: num(h.total_ooo_reply_count) };
});

let sPrep = [];
try { sPrep = $('Prep SURBL Calls').all().map(i => i.json); } catch (e) {}
let sRes = [];
try { sRes = $('SURBL Lookup').all().map(i => i && i.json); } catch (e) {}
// Status 3 is NXDOMAIN: not on the list. An A record answer is a listing. Anything else is
// not an answer we can read, so it is unknown rather than clean.
const readDns = (r) => {
  if (!r || typeof r !== 'object') return null;
  if (Array.isArray(r.Answer) && r.Answer.length) return true;
  if (r.Status === 3 || r.Status === 0) return false;
  return null;
};
let ctlListed = null; let ctlClean = null; const surblRaw = {};
sPrep.forEach((p, i) => {
  const v = readDns(sRes[i]);
  if (p.kind === 'control-listed') ctlListed = v;
  else if (p.kind === 'control-clean') ctlClean = v;
  else surblRaw[p.domain] = v;
});
const controlsOk = ctlListed === true && ctlClean === false;
const surblOf = (d) => {
  if (!controlsOk) return 'unknown';
  const v = surblRaw[d];
  return v === true ? 'listed' : (v === false ? 'clean' : 'unknown');
};

let hubDomains = [];
try { hubDomains = $('Get Hub Domains').all().map(i => i && i.json).filter(r => r && r.id); } catch (e) {}
const hubBy = {};
for (const r of hubDomains) {
  const f = r.fields || r;
  const d = String(f['Domain'] || '').toLowerCase();
  if (d) hubBy[d] = { id: r.id, flaggedOn: String(f['Flagged On'] || '') };
}

// ---------- the provisioning standard ----------
const providerOf = (p) => {
  const s = String(p || '').toUpperCase();
  if (s.includes('GOOGLE')) return 'google';
  if (s.includes('MICROSOFT') || s.includes('OUTLOOK') || s.includes('OFFICE')) return 'microsoft';
  return '';
};
const STANDARD = {
  google: { daily_limit: 25, gap: [11, 15], warmup_limit: [20, 30], reply_rate: [30, 40] },
  microsoft: { daily_limit: 3, gap: [60, 60], warmup_limit: [8, 8], reply_rate: [90, 90] },
};
// A signature may name the client the way ours do, "Dave(.)io", which is not a live domain.
const LIVE_DOMAIN = /\b[a-z0-9-]+\.(com|io|ai|co|net|org|biz|pro)\b/i;
const range = (v, r) => v >= r[0] && v <= r[1];
const rangeText = (r) => (r[0] === r[1] ? String(r[0]) : r[0] + ' to ' + r[1]);

function driftOf(a) {
  const prov = providerOf(a.provider);
  if (!prov) return [];
  const S = STANDARD[prov];
  const p = a.payload || {};
  const w = p.warmup || {};
  const adv = w.advanced || {};
  const out = [];
  if (num(p.daily_limit) !== S.daily_limit) out.push('daily limit ' + num(p.daily_limit) + ', standard ' + S.daily_limit);
  if (!range(num(p.sending_gap), S.gap)) out.push('sending gap ' + num(p.sending_gap) + ', standard ' + rangeText(S.gap));
  if (!range(num(w.limit), S.warmup_limit)) out.push('warmup limit ' + num(w.limit) + ', standard ' + rangeText(S.warmup_limit));
  if (!range(num(w.reply_rate), S.reply_rate)) out.push('warmup reply rate ' + num(w.reply_rate) + ', standard ' + rangeText(S.reply_rate));
  if (adv.weekday_only === true) out.push('warmup weekday only on');
  if (adv.warm_ctd === true) out.push('warmup warm CTD on');
  if (String(p.custom_domain || '').trim()) out.push('tracking domain set');
  if (String(p.reply_to || '').trim()) out.push('reply-to set');
  if (LIVE_DOMAIN.test(String(p.signature || ''))) out.push('signature carries a live domain');
  return out;
}

// ---------- per inbox ----------
const inboxes = accounts.map(a => {
  const p = a.payload || {};
  const hs = (p.analytics && p.analytics.health_scores) || {};
  const names = (Array.isArray(p.tags) ? p.tags : []).map(id => tagName[String(id)] || String(id));
  const lowered = names.map(n => n.toLowerCase());
  const created = a.timestamp_created ? DateTime.fromISO(String(a.timestamp_created)).setZone('Asia/Jerusalem') : null;
  return {
    id: String(a.id),
    email: String(a.email || ''),
    domain: (String(a.email || '').split('@')[1] || '').toLowerCase(),
    status: String(a.status || ''),
    provider: String(a.provider || ''),
    dailyLimit: num(p.daily_limit),
    warmupHealth: hs['7d_overall_warmup_health'] == null ? null : num(hs['7d_overall_warmup_health']),
    ageDays: created && created.isValid ? Math.floor(today.diff(created.startOf('day'), 'days').days) : 0,
    tagNames: names,
    isActive: lowered.includes('active'),
    hasGateway: lowered.includes('gateway'),
    batch: names.filter(n => /^[a-z0-9.]+-\d+$/i.test(n)).sort().join(', '),
    drift: driftOf(a),
  };
});

// ---------- per domain ----------
const FWD = ['f7', 'f14', 'f30', 'f60', 'f90', 'all'];
const BWD = ['b7', 'b14', 'b30', 'b60', 'b90', 'all'];
function windowTotals(members, key) {
  let sent = 0; let human = 0; let seen = 0;
  for (const m of members) {
    const w = (windows[m.id] || []).find(x => x.key === key);
    if (!w) continue;
    const s = bySpan[m.id + '|' + w.span];
    if (!s) continue;
    seen++; sent += s.sent; human += s.human;
  }
  return seen ? { sent, human } : null;
}
function firstReaching500(members, order) {
  for (const key of order) {
    const t = windowTotals(members, key);
    if (t && t.sent >= 500) return t;
  }
  return null;
}

const domainNames = [...new Set(inboxes.map(i => i.domain).filter(Boolean))].sort();
const domains = domainNames.map(d => {
  const members = inboxes.filter(i => i.domain === d);
  const allTime = windowTotals(members, 'all') || { sent: 0, human: 0 };
  const first500 = firstReaching500(members, FWD);
  const last500 = firstReaching500(members, BWD);
  const warmupScores = members.map(m => m.warmupHealth).filter(v => v != null);
  const warmupMin = warmupScores.length ? Math.min(...warmupScores) : null;
  const oldestDays = members.length ? Math.max(...members.map(m => m.ageDays)) : 0;
  const active = members.some(m => m.isActive);
  const surbl = surblOf(d);
  const batch = [...new Set(members.map(m => m.batch).filter(Boolean))].join(', ');
  const disconnected = members.filter(m => m.status !== 'ACTIVE');
  const drifting = members.filter(m => m.drift.length);

  const flags = []; const reasons = [];
  if (first500 && first500.human === 0) { flags.push('Never landed'); reasons.push('Never landed: 0 replies on the first ' + first500.sent + ' sends'); }
  if (last500 && last500.human === 0) { flags.push('Gone quiet'); reasons.push('Gone quiet: 0 replies on last ' + last500.sent + ' sends'); }
  if (warmupMin != null && warmupMin < 90 && oldestDays > 21) { flags.push('Warmup'); reasons.push('Warmup: ' + warmupMin + ', ' + oldestDays + ' days'); }
  if (surbl === 'listed') { flags.push('Listed'); reasons.push('Listed: SURBL multi.surbl.org'); }
  if (disconnected.length) {
    flags.push('Disconnected');
    const byStatus = {};
    for (const m of disconnected) byStatus[m.status || 'unknown'] = (byStatus[m.status || 'unknown'] || 0) + 1;
    for (const [s, n] of Object.entries(byStatus)) reasons.push('Disconnected: ' + n + ' inbox' + (n === 1 ? '' : 'es') + ' ' + s);
  }
  if (drifting.length) {
    flags.push('Drift');
    const bySetting = {};
    for (const m of drifting) for (const line of m.drift) bySetting[line] = (bySetting[line] || 0) + 1;
    for (const [line, n] of Object.entries(bySetting)) reasons.push('Drift: ' + n + ' inbox' + (n === 1 ? '' : 'es') + ' ' + line);
  }
  const existing = hubBy[d] || {};
  return {
    domain: d, active, batch, surbl, warmupMin, oldestDays,
    sentAllTime: allTime.sent, humanAllTime: allTime.human,
    first500, last500, flags, reasons,
    flaggedOn: existing.flaggedOn ? existing.flaggedOn : (flags.length ? today.toFormat('yyyy-MM-dd') : ''),
    inboxCount: members.length,
    driftLines: drifting.reduce((acc, m) => { for (const l of m.drift) acc.push({ line: l, active: m.isActive }); return acc; }, []),
    disconnected: disconnected.map(m => ({ email: m.email, status: m.status })),
  };
});

// ---------- client rollup ----------
const activeMailboxes = inboxes.filter(i => i.isActive && i.status === 'ACTIVE');
const notActiveMailboxes = inboxes.filter(i => !i.isActive);
const activeCapacity = activeMailboxes.reduce((s, i) => s + i.dailyLimit, 0);
const notActiveCapacity = notActiveMailboxes.reduce((s, i) => s + i.dailyLimit, 0);
const reserveRatio = activeCapacity ? (notActiveCapacity / activeCapacity) : 0;
const avgActiveLimit = activeMailboxes.length ? (activeCapacity / activeMailboxes.length) : 0;
const shortCapacity = Math.max(0, (activeCapacity * 0.5) - notActiveCapacity);
const shortMailboxes = avgActiveLimit ? Math.ceil(shortCapacity / avgActiveLimit) : 0;

// ---------- the gateway pool, re-derived ----------
// The only PlusVibe write this machine makes: clean domains join, listed domains leave.
const gwId = tagId['gateway'] || '';
const assign = []; const unassign = [];
if (gwId && controlsOk) {
  for (const d of domains) {
    const members = inboxes.filter(i => i.domain === d.domain);
    if (d.surbl === 'clean') for (const m of members) { if (!m.hasGateway) assign.push(m.id); }
    if (d.surbl === 'listed') for (const m of members) { if (m.hasGateway) unassign.push(m.id); }
  }
}

// ---------- the Slack block ----------
const stamp = nowIL.toFormat('ccc d LLL');
const label = (a) => (a ? 'active' : 'not active');
const bullets = (lines) => (lines.length ? lines : ['• none']).join('\n');
const flagged = (name) => domains.filter(d => d.flags.includes(name));

const driftAgg = {};
for (const d of domains) for (const x of d.driftLines) {
  const k = x.line + '|' + (x.active ? '1' : '0');
  driftAgg[k] = (driftAgg[k] || 0) + 1;
}
const driftLines = Object.entries(driftAgg)
  .sort((a, b) => b[1] - a[1])
  .map(([k, n]) => { const [line, act] = k.split('|'); return '• ' + n + ' mailbox' + (n === 1 ? '' : 'es') + ' · ' + (act === '1' ? 'active' : 'not active') + ' · ' + line; });

const head = isPool
  ? '🏦 *Pool · ' + clientName + '* · ' + inboxes.length + ' mailboxes · ' + inboxes.reduce((s, i) => s + i.dailyLimit, 0) + ' a day'
  : '📬 *Inbox health · ' + clientName + ' · ' + stamp + '*\n\n' +
    '*Active* · ' + activeMailboxes.length + ' mailboxes · ' + activeCapacity + ' a day\n' +
    '*Not active* · ' + notActiveMailboxes.length + ' mailboxes · ' + notActiveCapacity + ' a day\n' +
    '*Reserve* · ' + Math.round(reserveRatio * 100) + '% of active · ' + (shortMailboxes ? 'Short by ' + shortMailboxes + ' mailboxes' : 'OK');

const block = [
  head,
  '',
  '🚩 *Flags* · checked on active and not active alike',
  '',
  '*_Never landed_* · 0 replies on the first 500 sends',
  bullets(flagged('Never landed').map(d => '• ' + d.domain + ' · ' + label(d.active) + ' · 0 of ' + (d.first500 ? d.first500.sent : 0))),
  '',
  '*_Gone quiet_* · 0 replies on the last 500 sends',
  bullets(flagged('Gone quiet').map(d => '• ' + d.domain + ' · ' + label(d.active) + ' · 0 of ' + (d.last500 ? d.last500.sent : 0))),
  '',
  '*_Warmup under 90_* · mailbox older than 21 days',
  bullets(flagged('Warmup').map(d => '• ' + d.domain + ' · ' + label(d.active) + ' · ' + d.warmupMin)),
  '',
  '*_SURBL listed_*',
  bullets(flagged('Listed').map(d => '• ' + d.domain + ' · ' + label(d.active))),
  '',
  '*_Drift_* · setting off the standard',
  bullets(driftLines),
  '',
  '*_Disconnected_*',
  bullets(flagged('Disconnected').reduce((acc, d) => { for (const x of d.disconnected) acc.push('• ' + d.domain + ' · ' + label(d.active) + ' · ' + x.status); return acc; }, [])),
].join('\n');

const bundle = {
  clientName, clientRecId, isPool,
  pvWorkspace: String(cw.pvWorkspace || ''),
  gatewayTagId: gwId,
  controlsOk,
  surblNote: controlsOk ? '' : 'SURBL controls failed (test point listed=' + ctlListed + ', google clean=' + (ctlClean === false) + '); every domain marked unknown and the gateway tag left alone',
  statFailures,
  inboxes: inboxes.length,
  domains,
  rollup: {
    activeMailboxes: activeMailboxes.length, activeCapacity,
    notActiveMailboxes: notActiveMailboxes.length, notActiveCapacity,
    reserveRatio, shortMailboxes,
  },
  assign, unassign,
  block,
};

if (!inboxes.length) return [{ json: { _none: true, _b: bundle } }];
return inboxes.map((i, idx) => ({
  json: Object.assign(
    { 'Account ID': i.id, 'Drift': i.drift.join('\n') },
    idx === 0 ? { _b: bundle } : {}
  ),
}));
