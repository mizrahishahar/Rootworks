// @@standard:infrastructure
// Decide: standards/infrastructure.md applied once to one client. Reads the fleet as it stands after today's
// corrections (the read-back when they ran, the first read otherwise), the Monday stats read when this is a full
// run, and the Hub's domain rows for what a daily run does not re-read. Measures every correction from
// the read-back, never from a call's success. Writes nothing itself: it emits the Hub inbox rows, and leaves the
// domain rows, the client row and the report facts for the nodes after it.
const sd = $getWorkflowStaticData('global');
const cw = $('Loop Over Clients').first().json;
const scratch = sd.cw || {};
const full = !!(sd.launch && sd.launch.full);
const live = !!(sd.launch && sd.launch.live);
const nowIL = $now.setZone('Asia/Jerusalem');
const today = nowIL.startOf('day');
const DISC = STANDARD.flags.disconnected.status_in;
const up = (s) => String(s || '').toUpperCase();

// ---------- the standard, per inbox (the same functions as Plan Fixes) ----------
const providerOf = (p) => {
  const s = String(p || '').toUpperCase();
  if (s.includes('GOOGLE')) return 'google';
  if (s.includes('MICROSOFT') || s.includes('OUTLOOK') || s.includes('OFFICE')) return 'microsoft';
  return '';
};
const domainOf = (a) => (String(a.email || '').split('@')[1] || '').toLowerCase();
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : NaN; };
const within = (v, r) => Number.isFinite(v) && v >= r[0] && v <= r[1];
const LIVE_DOMAIN = /\b[a-z0-9-]+\.(com|io|ai|co|net|org|biz|pro|info|app|dev|us|uk)\b/i;

function driftOf(a) {
  const prov = providerOf(a.provider);
  if (!prov) return [];
  const S = STANDARD.settings[prov]; const J = STANDARD.jitter[prov] || {}; const E = STANDARD.settings.every;
  const p = a.payload || {}; const w = p.warmup || {}; const adv = w.advanced || {};
  const wr = p.warmup_rampup || {}; const sr = p.sending_rampup || {};
  const out = [];
  const exact = (v, want) => num(v) === want;
  const ok = (v, key, want) => (J[key] ? within(num(v), J[key]) : exact(v, want));
  const std = (key, want) => (J[key] ? J[key][0] + ' to ' + J[key][1] : String(want));
  if (!exact(p.daily_limit, S.daily_limit)) out.push({ text: 'daily limit ' + p.daily_limit + ', standard ' + S.daily_limit, fix: true });
  if (!ok(p.sending_gap, 'sending_gap_min', S.sending_gap_min)) out.push({ text: 'minutes between sends ' + p.sending_gap + ', standard ' + std('sending_gap_min', S.sending_gap_min), fix: true });
  if (sr.is_slow_rampup !== true) out.push({ text: 'sending ramp off', fix: true });
  else {
    if (!ok(sr.rampup_daily_limit, 'sending_ramp_start', S.sending_ramp.start)) out.push({ text: 'sending ramp start ' + sr.rampup_daily_limit + ', standard ' + std('sending_ramp_start', S.sending_ramp.start), fix: true });
    if (!exact(sr.rampup_daily_inc, S.sending_ramp.increment)) out.push({ text: 'sending ramp step ' + sr.rampup_daily_inc + ', standard ' + S.sending_ramp.increment, fix: true });
  }
  // A disconnected inbox has its warmup stopped by the disconnection itself: that is Disconnected, not a second flag.
  const disconnectedNow = STANDARD.flags.disconnected.status_in.includes(String(a.status || '').toUpperCase());
  if (E.warmup_on && !disconnectedNow && String(a.warmup_status || '').toUpperCase() !== 'ACTIVE') out.push({ text: 'warmup off', fix: false, warmupOff: true });
  if (!ok(w.limit, 'warmup_daily', S.warmup.daily)) out.push({ text: 'warmup daily ' + w.limit + ', standard ' + std('warmup_daily', S.warmup.daily), fix: true });
  if (wr.is_slow_rampup !== true) out.push({ text: 'warmup ramp off', fix: true });
  else if (!exact(wr.initial_daily_limit, S.warmup.ramp_start)) out.push({ text: 'warmup ramp start ' + wr.initial_daily_limit + ', standard ' + S.warmup.ramp_start, fix: true });
  if (!exact(w.increment, S.warmup.increment)) out.push({ text: 'warmup ramp step ' + w.increment + ', standard ' + S.warmup.increment, fix: true });
  if (!ok(w.reply_rate, 'warmup_reply_rate', S.warmup.reply_rate)) out.push({ text: 'warmup reply rate ' + w.reply_rate + '%, standard ' + std('warmup_reply_rate', S.warmup.reply_rate) + '%', fix: true });
  if (wr.randomize !== true) out.push({ text: 'warmup randomize off', fix: true });
  else if (!ok(wr.randomize_num, 'warmup_randomize', S.warmup.randomize)) out.push({ text: 'warmup randomize ' + wr.randomize_num + '%, standard ' + std('warmup_randomize', S.warmup.randomize) + '%', fix: true });
  if (!!adv.weekday_only !== E.weekday_only) out.push({ text: 'warmup weekday only on', fix: false });
  if (!!adv.warm_ctd !== E.warm_tracking_domain) out.push({ text: 'warmup on the tracking domain on', fix: false });
  if (!!Number(w.warmup_signature) !== E.signature_in_warmup) out.push({ text: 'signature added to warmup', fix: true });
  if (String(p.custom_domain || '').trim() !== E.custom_tracking_domain) out.push({ text: 'custom tracking domain set', fix: false });
  if (String(p.reply_to || '').trim() !== E.reply_to) out.push({ text: 'reply-to set', fix: true });
  const sig = String(p.signature || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  if (E.signature_present && !sig) out.push({ text: 'no signature', fix: false });
  else if (!E.signature_live_domain && LIVE_DOMAIN.test(sig)) out.push({ text: 'signature company name is a live domain', fix: false });
  return out;
}

// ---------- inputs ----------
const listPages = $('List Email Accounts').all().map(i => i && i.json).filter(Boolean);
const before = [];
for (const p of listPages) { if (Array.isArray(p.accounts)) before.push(...p.accounts); }
const readback = Array.isArray(scratch.readback) ? scratch.readback : null;
const afterById = {};
if (readback) for (const a of readback) afterById[String(a.id)] = a;
const accounts = before.map(a => afterById[String(a.id)] || a);

let tagItems = [];
try { tagItems = $('List Tags').all().map(i => i && i.json).filter(Boolean); } catch (e) {}
const tagList = [];
for (const t of tagItems) {
  if (Array.isArray(t)) tagList.push(...t);
  else if (Array.isArray(t.tags)) tagList.push(...t.tags);
  else if (t && t._id) tagList.push(t);
}
const tagName = {};
for (const t of tagList) if (t && t._id) tagName[String(t._id)] = String(t.name || t._id);

let hubRows = [];
try { hubRows = $('Get Hub Domains').all().map(i => i && i.json).filter(r => r && r.id); } catch (e) {}
const hubBy = {};
for (const r of hubRows) {
  const f = r.fields || r;
  const d = String(f['Domain'] || '').toLowerCase();
  if (!d) continue;
  hubBy[d] = {
    flaggedOn: String(f['Flagged On'] || ''),
    flags: Array.isArray(f['Flags']) ? f['Flags'].map(String) : [],
    reasons: String(f['Flag Reason'] || '').split('\n').filter(Boolean),
    first500: typeof f['First 500 Replies'] === 'number' ? f['First 500 Replies'] : null,
  };
}

const plan = scratch.plan || { reconnect: [], warmup: [], settings: [] };
const fixes = Array.isArray(scratch.fixes) ? scratch.fixes : [];
const failed = [];
for (const f of fixes) if (!f.ok) failed.push(f.kind + ' call for ' + f.ids.length + ' inbox(es) failed' + (f.status ? ' (HTTP ' + f.status + ')' : '') + (f.error ? ': ' + f.error : ''));
const planned = plan.reconnect.length + plan.warmup.length + plan.settings.length;
if (live && planned && !readback) failed.push('the read-back after the corrections returned nothing; corrections could not be measured');

// ---------- per inbox ----------
const lowerLanguages = STANDARD.tags.languages.map(String);
const inboxes = accounts.map(a => {
  const p = a.payload || {};
  const hs = (p.analytics && p.analytics.health_scores) || {};
  const names = (Array.isArray(p.tags) ? p.tags : []).map(id => tagName[String(id)] || String(id));
  const created = a.timestamp_created ? DateTime.fromISO(String(a.timestamp_created)).setZone('Asia/Jerusalem') : null;
  return {
    id: String(a.id),
    email: String(a.email || ''),
    domain: domainOf(a),
    status: up(a.status),
    warmupStatus: up(a.warmup_status),
    managed: !!providerOf(a.provider),
    dailyLimit: Number(p.daily_limit) || 0,
    warmupHealth: hs['7d_overall_warmup_health'] == null ? null : Number(hs['7d_overall_warmup_health']),
    createdDate: created && created.isValid ? created.toFormat('yyyy-MM-dd') : '',
    ageDays: created && created.isValid ? Math.floor(today.diff(created.startOf('day'), 'days').days) : 0,
    tagNames: names,
    isActive: names.map(n => n.toLowerCase()).includes(String(STANDARD.tags.active).toLowerCase()),
    hasLanguage: names.some(n => lowerLanguages.includes(n)),
    batch: names.filter(n => /^[a-z0-9.]+-\d+$/i.test(n)).sort().join(', '),
    drift: driftOf(a),
  };
});
const byId = {};
for (const i of inboxes) byId[i.id] = i;

// ---------- the corrections, measured ----------
const tried = (ids) => (live ? ids.filter(id => byId[id]) : []);
const reconnectTried = tried(plan.reconnect);
const warmupTried = tried(plan.warmup);
const settingsTried = tried(plan.settings);
const domainsOf = (ids) => [...new Set(ids.map(id => byId[id] && byId[id].domain).filter(Boolean))].sort();
// What no correction can reach (the tracking domain, a missing signature...), counted by setting, for the report.
const notFixable = {};
for (const i of inboxes) for (const x of i.drift) if (!x.fix && !x.warmupOff) notFixable[x.text] = (notFixable[x.text] || 0) + 1;
const changes = {
  live,
  reconnect: {
    planned: plan.reconnect.length, tried: reconnectTried.length,
    held: reconnectTried.filter(id => !DISC.includes(byId[id].status)).length,
    plannedDomains: domainsOf(plan.reconnect),
    stillDown: domainsOf(reconnectTried.filter(id => DISC.includes(byId[id].status))),
  },
  warmup: { planned: plan.warmup.length, tried: warmupTried.length, on: warmupTried.filter(id => byId[id].warmupStatus === 'ACTIVE').length, domains: domainsOf(plan.warmup) },
  settings: { planned: plan.settings.length, tried: settingsTried.length, fixed: settingsTried.filter(id => !byId[id].drift.some(x => x.fix)).length, what: scratch.settingsWhat || {} },
  notFixable,
};

// ---------- the Monday read ----------
const stats = full ? scratch.stats : null;
if (full && stats && !stats.ok) failed.push(stats.failedPages + ' stats page(s) failed; Never landed and Gone quiet kept from the last full read');
if (full && !stats) failed.push('the stats read did not run; Never landed and Gone quiet kept from the last full read');

const G = STANDARD.flags.gone_quiet; const N = STANDARD.flags.never_landed; const W = STANDARD.flags.warmup;
function replyReads(members) {
  if (!stats || !stats.ok) return null;
  const days = {};
  for (const m of members) {
    const d = stats.byInbox[m.id] || {};
    for (const [date, pair] of Object.entries(d)) {
      const x = days[date] || (days[date] = [0, 0]);
      x[0] += pair[0]; x[1] += pair[1];
    }
  }
  const dates = Object.keys(days).sort();
  const total = dates.reduce((s, d) => s + days[d][0], 0);
  const created = members.map(m => m.createdDate).filter(Boolean).sort()[0] || '';
  // Only a domain born inside the 90-day window has its first sends in the window.
  const bornInWindow = !!created && !!stats.start && created >= stats.start;
  let first = null;
  if (bornInWindow) {
    let s = 0; let r = 0;
    for (const d of dates) { s += days[d][0]; r += days[d][1]; if (s >= N.first_sends) { first = { sent: s, replies: r }; break; } }
  }
  // Gone quiet reads the two latest batches, never a domain's first 250: a domain born in the window needs the
  // standard's total; one born before it already sent its first 250 outside the window.
  let latest = null; let previous = null;
  const eligible = bornInWindow ? total >= G.from_sends : total >= 2 * G.batch;
  if (eligible) {
    let i = dates.length - 1; let s = 0; let r = 0;
    for (; i >= 0; i--) { s += days[dates[i]][0]; r += days[dates[i]][1]; if (s >= G.batch) break; }
    if (s >= G.batch) {
      let s2 = 0; let r2 = 0;
      for (i = i - 1; i >= 0; i--) { s2 += days[dates[i]][0]; r2 += days[dates[i]][1]; if (s2 >= G.batch) break; }
      if (s2 >= G.batch) { latest = { sent: s, replies: r }; previous = { sent: s2, replies: r2 }; }
    }
  }
  return { total, first, latest, previous };
}

// ---------- per domain ----------
const domainNames = [...new Set(inboxes.map(i => i.domain).filter(Boolean))].sort();
const domains = domainNames.map(d => {
  const members = inboxes.filter(i => i.domain === d);
  const hub = hubBy[d] || { flaggedOn: '', flags: [], reasons: [], first500: null };
  const active = members.some(m => m.isActive);
  const disconnected = members.filter(m => DISC.includes(m.status));
  const drifting = members.filter(m => m.drift.length);
  const scores = members.map(m => m.warmupHealth).filter(v => v != null && Number.isFinite(v));
  const warmupMin = scores.length ? Math.min(...scores) : null;
  const oldestDays = members.length ? Math.max(...members.map(m => m.ageDays)) : 0;
  const flags = []; const reasons = [];
  const keep = (flag) => { if (hub.flags.includes(flag)) { flags.push(flag); reasons.push(...hub.reasons.filter(l => l.startsWith(flag + ':'))); } };

  if (disconnected.length) {
    flags.push('Disconnected');
    const statuses = [...new Set(disconnected.map(m => m.status))].join(', ');
    reasons.push('Disconnected: ' + disconnected.length + ' of ' + members.length + ' inbox(es) ' + statuses + (live && disconnected.some(m => plan.reconnect.includes(m.id)) ? ' after a reconnect try' : ''));
  }
  if (drifting.length) {
    flags.push('Drift');
    const count = {};
    for (const m of drifting) for (const x of m.drift) count[x.text] = (count[x.text] || 0) + 1;
    for (const [t, n] of Object.entries(count)) reasons.push('Drift: ' + t + (n > 1 ? ' (' + n + ' inboxes)' : ''));
  }
  if (warmupMin != null && warmupMin < W.score_below && oldestDays > W.oldest_inbox_days_over) {
    flags.push('Warmup');
    reasons.push('Warmup: score ' + warmupMin + ', oldest inbox ' + oldestDays + ' days');
  }

  const row = { domain: d, active, batch: [...new Set(members.map(m => m.batch).filter(Boolean))].join(', '), warmupMin, oldestDays, flags, reasons };
  const reads = full ? replyReads(members) : null;
  if (reads) {
    const firstReplies = reads.first ? reads.first.replies : hub.first500;
    if (typeof firstReplies === 'number') row.first500 = firstReplies;
    if (firstReplies === N.replies) {
      flags.push('Never landed');
      reasons.push('Never landed: ' + firstReplies + ' replies in the first ' + (reads.first ? reads.first.sent : N.first_sends) + ' sends');
    }
    if (reads.latest && reads.previous) {
      row.latest250 = reads.latest.replies;
      row.previous250 = reads.previous.replies;
      if (reads.latest.replies < G.below_share_of_previous * reads.previous.replies) {
        flags.push('Gone quiet');
        reasons.push('Gone quiet: ' + reads.latest.replies + ' replies in the latest ' + reads.latest.sent + ' sends, against ' + reads.previous.replies + ' in the ' + reads.previous.sent + ' before');
      }
    }
  } else {
    // A daily run, or a Monday whose stats failed: these flags stand as the last full read left them.
    keep('Never landed');
    keep('Gone quiet');
  }
  row.flaggedOn = hub.flaggedOn || (flags.length ? today.toFormat('yyyy-MM-dd') : '');
  row.emergency = disconnected.filter(m => m.isActive).map(m => ({ email: m.email, status: m.status }));
  return row;
});

// ---------- the client ----------
const activeInboxes = inboxes.filter(i => i.isActive && i.status === 'ACTIVE');
const notActiveInboxes = inboxes.filter(i => !i.isActive);
const activeCapacity = activeInboxes.reduce((s, i) => s + i.dailyLimit, 0);
const notActiveCapacity = notActiveInboxes.reduce((s, i) => s + i.dailyLimit, 0);
const minRatio = STANDARD.flags.reserve_short.reserve_ratio_below;
const reserveRatio = activeCapacity ? notActiveCapacity / activeCapacity : null;
// A client with nothing active yet is still warming its first inboxes: exempt.
const reserveShort = activeCapacity > 0 && reserveRatio < minRatio;
const avgLimit = activeInboxes.length ? activeCapacity / activeInboxes.length : 0;
const shortInboxes = reserveShort && avgLimit ? Math.ceil((activeCapacity * minRatio - notActiveCapacity) / avgLimit) : 0;
const rollup = { activeInboxes: activeInboxes.length, activeCapacity, notActiveInboxes: notActiveInboxes.length, notActiveCapacity, reserveRatio, reserveShort, shortInboxes };

sd.cw.domainRows = domains;
sd.cw.clientRow = rollup;
sd.results.push({
  client: String(cw.clientName || ''),
  clientRecId: String(cw.clientRecId || ''),
  isPool: !!cw.isPool,
  clientChannel: String(cw.clientChannel || ''),
  clientReports: !!cw.clientReports,
  full, live,
  twoLanguage: inboxes.some(i => i.hasLanguage),
  inboxes: inboxes.length,
  rollup,
  domains: domains.map(d => ({ domain: d.domain, active: d.active, flags: d.flags, reasons: d.reasons })),
  emergencies: domains.reduce((a, d) => a.concat(d.emergency), []),
  changes,
  failed,
});

if (!inboxes.length) return [{ json: { _none: true } }];
return inboxes.map(i => ({ json: { 'Account ID': i.id, 'Drift': i.drift.map(x => x.text).join('\n') } }));
