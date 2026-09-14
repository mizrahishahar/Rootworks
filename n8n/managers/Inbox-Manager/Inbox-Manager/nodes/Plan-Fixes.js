// @@standard:infrastructure
// Plan Fixes: today's corrections for one client, per standards/infrastructure.md, Corrected without asking.
// - one reconnect try for every inbox whose status is a disconnected one
// - warmup switched back on for every connected Google or Microsoft inbox where it is off
// - every connected Google or Microsoft inbox off a setting this machine can set goes back to standard, inside
//   its jitter range: the numbers of each inbox come from its domain and its place on the domain, so two inboxes
//   on one domain never get the same numbers, and a second run lands on the same numbers
// The custom tracking domain, weekday-only warmup, warming the tracking domain and the signature cannot be set
// here; Decide reports them. One item per API call. On a dry run, or with nothing to do, one _noop item: the
// plan is still recorded in sd.cw.plan so the report can say what would change.
const sd = $getWorkflowStaticData('global');
const cw = $('Loop Over Clients').first().json;
const live = !!(sd.launch && sd.launch.live);
const BASE = 'https://api.plusvibe.ai/api/v1';
const DISC = STANDARD.flags.disconnected.status_in;

const pages = $('List Email Accounts').all().map(i => i && i.json).filter(Boolean);
const accounts = [];
for (const p of pages) { if (Array.isArray(p.accounts)) accounts.push(...p.accounts); }

// ---------- the standard, per inbox (the same functions as Decide) ----------
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

// ---------- the numbers a corrected inbox gets ----------
const hash = (s) => { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
// A value inside the range, moved by a different step per setting, so neighbours on a domain differ.
const pick = (range, fixed, seed, step) => (range ? range[0] + ((seed * step) % (range[1] - range[0] + 1)) : fixed);
function profileFor(a, position) {
  const prov = providerOf(a.provider);
  const S = STANDARD.settings[prov]; const J = STANDARD.jitter[prov] || {}; const E = STANDARD.settings.every;
  const seed = (hash(domainOf(a)) % 997) + position;
  return {
    daily_limit: S.daily_limit,
    interval_limit_in_min: pick(J.sending_gap_min, S.sending_gap_min, seed, 1),
    bulk_is_slow_rampup: S.sending_ramp.on ? 'yes' : 'no',
    bulk_rampup_daily_limit: pick(J.sending_ramp_start, S.sending_ramp.start, seed, 2),
    bulk_rampup_daily_inc: S.sending_ramp.increment,
    bulk_warmup_is_slow_rampup: 'yes',
    warmup_initial_daily_limit: S.warmup.ramp_start,
    warmup_pace_increment: S.warmup.increment,
    warmup_max_daily_limit: pick(J.warmup_daily, S.warmup.daily, seed, 7),
    // The bulk update takes the reply rate as a fraction; the account reads it back as a percent.
    warmup_reply_rate: pick(J.warmup_reply_rate, S.warmup.reply_rate, seed, 3) / 100,
    warmup_randomize: 'yes',
    warmup_randomize_num: pick(J.warmup_randomize, S.warmup.randomize, seed, 5),
    warmup_signature: E.signature_in_warmup ? 'yes' : 'no',
    clear_reply_to: E.reply_to === '' ? 'yes' : 'no',
  };
}

// ---------- the plan ----------
const up = (s) => String(s || '').toUpperCase();
const reconnect = accounts.filter(a => DISC.includes(up(a.status))).map(a => String(a.id));
const managed = accounts.filter(a => providerOf(a.provider));
const warmup = managed.filter(a => up(a.status) === 'ACTIVE' && up(a.warmup_status) !== 'ACTIVE').map(a => String(a.id));

const byDomain = {};
for (const a of managed) (byDomain[domainOf(a)] = byDomain[domainOf(a)] || []).push(a);
const groups = {};
const settings = [];
for (const members of Object.values(byDomain)) {
  members.sort((x, y) => String(x.email).localeCompare(String(y.email)));
  members.forEach((a, position) => {
    if (up(a.status) !== 'ACTIVE') return;
    if (!driftOf(a).some(x => x.fix)) return;
    const body = profileFor(a, position);
    const key = JSON.stringify(body);
    (groups[key] = groups[key] || { body, ids: [] }).ids.push(String(a.id));
    settings.push(String(a.id));
  });
}

const chunk = (ids) => { const out = []; for (let i = 0; i < ids.length; i += 100) out.push(ids.slice(i, i + 100)); return out; };
const calls = [];
for (const ids of chunk(reconnect)) calls.push({ kind: 'reconnect', method: 'POST', url: BASE + '/account/bulk-reconnect', body: { workspace_id: cw.pvWorkspace, ids } });
for (const ids of chunk(warmup)) calls.push({ kind: 'warmup', method: 'PATCH', url: BASE + '/account/bulk-update-warmup', body: { workspace_id: cw.pvWorkspace, ids, warmup_status: 'ACTIVE' } });
for (const g of Object.values(groups)) for (const ids of chunk(g.ids)) calls.push({ kind: 'settings', method: 'PUT', url: BASE + '/account/bulk-update', body: Object.assign({ workspace_id: cw.pvWorkspace, ids }, g.body) });

sd.cw.plan = { live, reconnect, warmup, settings, calls: calls.length };
if (!live || !calls.length) return [{ json: { _noop: true } }];
return calls.map(c => ({ json: c }));
