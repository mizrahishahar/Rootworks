// Build Messages: the Inbox Manager's report, in the Campaigns Manager's shape. One message per client to
// #flowroots-infra: every client on a full run (Monday or launched), only clients with an emergency on the other
// days; a quiet day posts nothing. Each section is a Slack heading with an emoji, detail sits in monospace blocks
// kept under 80 columns, every section of the report shows even when empty. THIS RUN closes every message: what
// was read, every correction and its measured result, the campaign senders, the Hub rows, the client draft. On a
// dry run a banner says nothing changed, and every correction a live run would make is marked not applied.
// For a client switched on (Infra Reports to Client), a second message in client wording, marked as a draft for
// the client's channel: it reaches the client only when the Operator sends it.
const sd = $getWorkflowStaticData('global');
const INFRA = 'C0B8KTGV603'; // #flowroots-infra
const results = sd.results || [];

// The allocation's own read-back, per client and per campaign.
try {
  const calls = $('Prep Allocate Calls').all().map(i => i.json).filter(c => !c._none);
  const res = $('Fire Allocate').all().map(i => (i && i.json) || {});
  calls.forEach((c, i) => {
    const r = results.find(x => x.client === c.client);
    if (!r) return;
    const x = res[i] || {};
    const body = x.body === undefined ? x : x.body;
    if (body && body.ok === true) {
      const camps = Array.isArray(body.campaigns) ? body.campaigns : [];
      const list = camps.map(k => ({ name: String(k.name || ''), added: (k.added || []).length, removed: (k.removed || []).length, failed: (k.failed || []).length, matches: k.matches_tag }));
      r.allocation = { campaigns: camps.length, list };
      const failedOps = list.reduce((s, k) => s + k.failed, 0);
      const mismatched = list.filter(k => k.matches === false).length;
      if (failedOps) r.failed.push('campaign senders: ' + failedOps + ' change(s) failed');
      if (mismatched) r.failed.push('campaign senders: ' + mismatched + ' campaign(s) do not match the active inboxes after the change');
    } else if (body && /no tag named/i.test(String(body.error || ''))) {
      r.allocation = { skipped: 'no active tag in this workspace' };
    } else {
      r.allocation = { failed: true };
      r.failed.push('campaign senders: the allocation call failed' + (body && body.error ? ': ' + String(body.error).slice(0, 150) : ''));
    }
  });
} catch (e) {}

const fmt = v => Number(v || 0).toLocaleString('en-US');
const pad = (s, n) => { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n); };
const rpad = (s, n) => String(s == null ? '' : s).padStart(n);
const WIDTH = 78; // every block line fits a Slack code block without wrapping
const clip = s => { s = String(s); return s.length > WIDTH ? s.slice(0, WIDTH - 1) + '…' : s; };
const block = rows => '```\n' + rows.map(clip).join('\n') + '\n```';
const cap = (rows, n = 25) => (rows.length > n ? rows.slice(0, n).concat(['… and ' + (rows.length - n) + ' more']) : rows);
const many = (n, one, more) => fmt(n) + ' ' + (n === 1 ? one : (more || one + 's'));
const chip = s => '`' + s + '`';
const campaignTitle = s => String(s || '').replace(/^\d{4}-\d{2}-\d{2}\s*-\s*/, '').split(/\s+-\s+/).join(', ');
// Domains laid out three to a line, so twenty-five domains are nine lines, not twenty-five.
const grid = (cells, cols = 3, w = 26) => { const rows = []; for (let i = 0; i < cells.length; i += cols) rows.push(cells.slice(i, i + cols).map(c => pad(c, w)).join('').trimEnd()); return rows; };
// The flag reasons as the Hub stores them, said short enough for one line of a block.
const short = s => String(s)
  .replace(/^(\d+) replies in the latest (\d+) sends, against (\d+) in the (\d+) before$/, '$1 replies in last $2 sends, $3 before')
  .replace(/^(\d+) replies in the first (\d+) sends$/, '$1 replies in first $2 sends')
  .replace(/^(\d+) of (\d+) inbox\(es\) ([A-Z, ]+?)( after a reconnect try)?$/, '$1 of $2 inboxes $3')
  .replace(/^score ([\d.]+), oldest inbox (\d+) days$/, 'score $1, $2 days old')
  .replace(/ \((\d+) inboxes\)/g, ' ($1)');
const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem' });
const FLAGS = [
  ['Disconnected', ':electric_plug:'],
  ['Drift', ':wrench:'],
  ['Warmup', ':thermometer:'],
  ['Never landed', ':no_entry_sign:'],
  ['Gone quiet', ':mute:'],
];
const L = 14; // the label column of THIS RUN
const row = (label, text) => pad(label, L) + text;
const sub = (text) => pad('', L) + '· ' + text;

const out = [];
for (const r of results) {
  if (!r.inboxes) continue;
  const R = r.rollup;
  const E = r.emergencies || [];
  const ch = r.changes;
  const live = r.live;
  const emergencyDomains = [...new Set(E.map(e => String(e.email).split('@')[1] || ''))].sort();

  if (r.full || E.length) {
    const title = r.isPool ? 'FLOWROOTS POOL' : r.client.toUpperCase();
    const parts = ['*' + title + '*  ·  ' + today + '  ·  ' + many(r.inboxes, 'inbox', 'inboxes') + '  ·  ' + fmt(R.activeCapacity) + ' a day active  ·  ' + (r.full ? 'weekly report' : 'emergency')];
    if (!live) parts.push('', ':test_tube: *DRY RUN*  ' + chip('nothing was changed on PlusVibe'), '_Every line in THIS RUN marked_ ' + chip('not applied') + ' _is what a live run would do._');

    // Emergency
    if (E.length) {
      const counts = {};
      for (const e of E) { const d = String(e.email).split('@')[1] || ''; counts[d] = (counts[d] || 0) + 1; }
      const statuses = [...new Set(E.map(e => e.status))].join(' / ');
      const perDomain = [...new Set(Object.values(counts))];
      const uniform = perDomain.length === 1;
      const lead = uniform ? (perDomain[0] === 1 ? 'the active inbox on each of these domains:' : (perDomain[0] === 2 ? 'both inboxes on each of these domains:' : 'all ' + perDomain[0] + ' inboxes on each of these domains:')) : 'domains, with how many of their active inboxes are down:';
      const cells = emergencyDomains.map(d => uniform ? d : d + ' (' + counts[d] + ')');
      parts.push('', ':rotating_light: *EMERGENCY*  ' + chip(many(E.length, 'active inbox', 'active inboxes') + ' not sending') + '  ' + chip(statuses) + '  ' + chip(many(emergencyDomains.length, 'domain')),
        live ? '_Still disconnected after a reconnect try. The fix is at the inbox provider; reconnect on PlusVibe once it is live._'
          : '_Disconnected. A live run tries one reconnect first and posts only what stays down._',
        block([lead, ''].concat(grid(cells))));
    }

    // The weekly picture
    if (r.full) {
      parts.push('', ':bar_chart: *CAPACITY*', block([
        pad('active', 12) + rpad(fmt(R.activeInboxes), 6) + ' inboxes' + rpad(fmt(R.activeCapacity), 9) + ' a day',
        pad('not active', 12) + rpad(fmt(R.notActiveInboxes), 6) + ' inboxes' + rpad(fmt(R.notActiveCapacity), 9) + ' a day',
        pad('reserve', 12) + rpad(R.reserveRatio == null ? 'n/a' : Math.round(R.reserveRatio * 100) + '%', 6) + '  ' + (R.reserveShort ? 'SHORT: order ' + many(R.shortInboxes, 'inbox', 'inboxes') + ' this week' : (R.reserveRatio == null ? 'nothing active yet' : 'at least 50%, OK')),
      ]));
      const flagged = r.domains.filter(d => d.flags.length).length;
      parts.push('', ':triangular_flag_on_post: *FLAGS*  ' + chip(many(flagged, 'domain') + ' flagged') + '  ' + chip(many(r.domains.length, 'domain') + ' read'));
      for (const [f, emoji] of FLAGS) {
        // Domains already in the emergency are not listed twice.
        const skip = f === 'Disconnected' ? emergencyDomains : [];
        const lines = r.domains.filter(d => d.flags.includes(f) && !skip.includes(d.domain)).map(d =>
          pad(d.domain, 26) + pad(d.active ? 'active' : 'not active', 12) +
          d.reasons.filter(l => l.startsWith(f + ':')).map(l => short(l.slice(f.length + 2))).join('; '));
        const note = skip.length ? '_the ' + many(skip.length, 'domain') + ' in the emergency above' + (lines.length ? ', plus:' : '') + '_' : '';
        if (lines.length) parts.push(emoji + ' _' + f + '_' + (note ? '  ' + note : ''), block(cap(lines)));
        else parts.push(emoji + ' _' + f + ':_  ' + (note || 'none'));
      }
    }

    // Everything this run did
    const NA = live ? '' : '  [not applied]';
    const lines = [];
    lines.push(row('read', many(r.inboxes, 'inbox', 'inboxes') + ' on ' + many(r.domains.length, 'domain') +
      (r.full ? (r.read && r.read.statsPages ? ', reply stats to ' + r.read.statsTo : ', no reply stats') : ', settings and status')));
    if (ch.reconnect.planned) {
      lines.push(row('reconnect', live ? ch.reconnect.held + ' of ' + many(ch.reconnect.tried, 'inbox', 'inboxes') + ' connected after one try' : 'try ' + many(ch.reconnect.planned, 'inbox', 'inboxes') + ' on ' + many(ch.reconnect.plannedDomains.length, 'domain') + NA));
      if (live && ch.reconnect.stillDown.length) lines.push(sub('still down: ' + many(ch.reconnect.stillDown.length, 'domain') + ', listed above'));
    } else lines.push(row('reconnect', 'nothing disconnected'));
    if (ch.warmup.planned) lines.push(row('warmup', live ? 'switched on for ' + ch.warmup.on + ' of ' + many(ch.warmup.tried, 'inbox', 'inboxes') : 'switch on for ' + many(ch.warmup.planned, 'inbox', 'inboxes') + NA));
    else lines.push(row('warmup', 'on everywhere it should be'));
    if (ch.settings.planned) {
      lines.push(row('settings', live ? ch.settings.fixed + ' of ' + many(ch.settings.tried, 'inbox', 'inboxes') + ' back in standard' : 'set ' + many(ch.settings.planned, 'inbox', 'inboxes') + ' back to standard' + NA));
      for (const [what, n] of Object.entries(ch.settings.what || {}).sort((a, b) => b[1] - a[1]).slice(0, 6)) lines.push(sub(what + ' (' + n + ')'));
    } else lines.push(row('settings', 'every setting it can set is in standard'));
    const nf = Object.entries(ch.notFixable || {}).sort((a, b) => b[1] - a[1]);
    if (nf.length) {
      lines.push(row('by hand', 'off standard, and not settable by this machine'));
      for (const [what, n] of nf.slice(0, 4)) lines.push(sub(what + ' (' + n + ')'));
    }
    const a = r.allocation || {};
    if (a.skipped) lines.push(row('senders', a.skipped === 'dry run, campaign senders not checked' ? 'set running campaigns to the active inboxes' + NA : a.skipped));
    else if (a.failed) lines.push(row('senders', 'the allocation call failed'));
    else if (a.list) {
      const changed = a.list.filter(k => k.added || k.removed);
      lines.push(row('senders', changed.length ? changed.length + ' of ' + many(a.campaigns, 'running campaign') + ' changed' : 'all ' + many(a.campaigns, 'running campaign') + ' already match'));
      for (const k of changed.slice(0, 5)) lines.push(sub(pad(campaignTitle(k.name), 44) + ' +' + k.added + ' -' + k.removed));
    }
    if (r.hub) lines.push(row('hub', fmt(r.hub.inboxes) + ' inbox rows, ' + fmt(r.hub.domains) + ' domain rows, ' + (r.hub.client ? 'client row' : 'no client row')));
    lines.push(row('client draft', r.isPool ? 'not for the pool' : (r.clientReports ? (r.clientChannel ? 'below, for the client channel' : 'on, but no client channel on the Hub') : 'off for this client')));
    parts.push('', ':gear: *THIS RUN*', block(lines));

    // Errors are sentences, not columns: bullets that wrap, never cut.
    if (r.failed.length) parts.push('', ':warning: *COULD NOT COMPLETE*', cap(r.failed).map(f => '• ' + f).join('\n'));
    out.push({ json: { channel: INFRA, text: parts.join('\n'), client: r.client, kind: 'internal' } });
  }

  if (r.clientReports && r.clientChannel && !r.isPool && (r.full || E.length)) {
    const q = [];
    if (E.length) {
      q.push(':rotating_light: *Heads-up on your email sending*');
      q.push(E.length + ' of your ' + (R.activeInboxes + E.length) + ' active sending inboxes disconnected and are not sending right now. We tried reconnecting them this morning and are working on it now. We will update you as soon as they are back.');
    }
    if (r.full) {
      const attention = r.domains.filter(d => d.flags.some(f => ['Disconnected', 'Warmup', 'Never landed', 'Gone quiet'].includes(f))).length;
      if (q.length) q.push('');
      q.push(':bar_chart: *Weekly sending infrastructure update, ' + today + '*');
      q.push('• ' + fmt(R.activeInboxes) + ' inboxes sending, up to ' + fmt(R.activeCapacity) + ' emails a day');
      q.push('• ' + fmt(R.notActiveInboxes) + ' more inboxes warming up in reserve' + (R.reserveShort ? ', below our reserve target, so more are being added' : ''));
      q.push(attention ? '• ' + attention + ' sending domain' + (attention === 1 ? '' : 's') + ' need attention this week and are being handled' : '• All sending domains look healthy this week');
    }
    out.push({ json: {
      channel: INFRA,
      text: ':memo: *DRAFT FOR ' + r.client.toUpperCase() + '*  ' + chip('not sent') + '  send it in <#' + r.clientChannel + '> once approved\n' + q.map(l => '> ' + l).join('\n'),
      client: r.client, kind: 'client draft',
    } });
  }
}
sd.messages = out.length;
if (!out.length) return [{ json: { _none: true } }];
return out;
