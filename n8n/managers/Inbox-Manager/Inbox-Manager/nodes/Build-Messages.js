// Build Messages: the report, in the Campaigns Manager's shape. One message per client to #flowroots-infra: every
// client on a full run (Monday or launched), only clients with an emergency on the other days; a quiet day posts
// nothing. Bold section headers, code blocks with aligned columns, tags in brackets. Every change the run made is
// one line. For a client switched on (Infra Reports to Client), a second message in client wording, marked as a
// draft for the client's channel: it reaches the client only when the Operator sends it.
const sd = $getWorkflowStaticData('global');
const INFRA = 'C0B8KTGV603'; // #flowroots-infra
const results = sd.results || [];

// The allocation's own read-back, per client.
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
      const added = camps.reduce((s, k) => s + (k.added || []).length, 0);
      const removed = camps.reduce((s, k) => s + (k.removed || []).length, 0);
      const failedOps = camps.reduce((s, k) => s + (k.failed || []).length, 0);
      const mismatched = camps.filter(k => k.matches_tag === false).length;
      r.allocation = { campaigns: camps.length, changed: camps.filter(k => (k.added || []).length || (k.removed || []).length).length, added, removed };
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
const block = rows => '```\n' + rows.join('\n') + '\n```';
const cap = (rows, n = 25) => (rows.length > n ? rows.slice(0, n).concat(['… and ' + (rows.length - n) + ' more']) : rows);
const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem' });
const ORDER = ['Disconnected', 'Drift', 'Warmup', 'Never landed', 'Gone quiet'];

const out = [];
for (const r of results) {
  if (!r.inboxes) continue;
  const R = r.rollup;
  const emergencies = r.emergencies || [];
  if (r.full || emergencies.length) {
    const title = r.isPool ? 'FLOWROOTS POOL' : r.client.toUpperCase();
    const parts = ['*' + title + ' · inboxes · ' + today + (r.full ? '' : ' · emergency') + (r.live ? '' : ' · dry run') + '*'];
    if (emergencies.length) {
      const byDomain = {};
      for (const e of emergencies) { const d = String(e.email).split('@')[1] || ''; (byDomain[d] = byDomain[d] || []).push(e); }
      const rows = Object.keys(byDomain).sort().map(d => pad(d, 30) + rpad(byDomain[d].length, 3) + ' inbox(es)  ' + [...new Set(byDomain[d].map(e => e.status))].join(', '));
      parts.push('*EMERGENCY · ' + emergencies.length + ' active inbox(es) disconnected' + (r.live ? ' after a reconnect try' : '') + '*', block(cap(rows)));
    }
    if (r.full) {
      parts.push('*CAPACITY*', block([
        pad('active', 12) + rpad(fmt(R.activeInboxes), 6) + ' inboxes' + rpad(fmt(R.activeCapacity), 9) + ' a day',
        pad('not active', 12) + rpad(fmt(R.notActiveInboxes), 6) + ' inboxes' + rpad(fmt(R.notActiveCapacity), 9) + ' a day',
        pad('reserve', 12) + rpad(R.reserveRatio == null ? 'n/a' : Math.round(R.reserveRatio * 100) + '%', 6) + (R.reserveShort ? '  [SHORT by ' + R.shortInboxes + ' inboxes]' : ''),
      ]));
      for (const f of ORDER) {
        const lines = r.domains.filter(d => d.flags.includes(f)).map(d =>
          pad(d.domain, 30) + '  ' + pad(d.active ? 'active' : 'not active', 10) + '  ' +
          d.reasons.filter(l => l.startsWith(f + ':')).map(l => l.slice(f.length + 2)).join('; '));
        parts.push('*' + f.toUpperCase() + '*', block(lines.length ? cap(lines) : ['none']));
      }
    }
    const ch = r.changes;
    const lines = [];
    const would = r.live ? '' : 'would ';
    if (ch.reconnect.planned) lines.push(pad(would + 'reconnect', 26) + (r.live ? ch.reconnect.held + ' of ' + ch.reconnect.tried + ' inbox(es) connected after' : ch.reconnect.planned + ' inbox(es)'));
    if (ch.warmup.planned) lines.push(pad(would + 'switch warmup on', 26) + (r.live ? ch.warmup.on + ' of ' + ch.warmup.tried + ' inbox(es) on after' : ch.warmup.planned + ' inbox(es)'));
    if (ch.settings.planned) lines.push(pad(would + 'set settings back', 26) + (r.live ? ch.settings.fixed + ' of ' + ch.settings.tried + ' inbox(es) in standard after' : ch.settings.planned + ' inbox(es)'));
    const a = r.allocation || {};
    if (a.skipped) lines.push(pad('campaign senders', 26) + a.skipped);
    else if (a.campaigns != null && a.changed) lines.push(pad('campaign senders', 26) + a.changed + ' of ' + a.campaigns + ' campaign(s), +' + a.added + ' -' + a.removed);
    if (lines.length) parts.push('*' + (r.live ? 'CHANGED' : 'WOULD CHANGE') + '*', block(lines));
    if (r.failed.length) parts.push('*COULD NOT COMPLETE*', block(cap(r.failed)));
    out.push({ json: { channel: INFRA, text: parts.join('\n'), client: r.client, kind: 'internal' } });
  }

  if (r.clientReports && r.clientChannel && !r.isPool && (r.full || emergencies.length)) {
    const q = [];
    if (emergencies.length) {
      q.push('Quick heads-up on your email sending: ' + emergencies.length + ' of your ' + (R.activeInboxes + emergencies.length) +
        ' active sending inboxes disconnected and are not sending right now. We tried reconnecting them this morning and are working on it now. We will update you as soon as they are back.');
    }
    if (r.full) {
      const attention = r.domains.filter(d => d.flags.some(f => ['Disconnected', 'Warmup', 'Never landed', 'Gone quiet'].includes(f))).length;
      q.push('Weekly sending infrastructure update, ' + today);
      q.push('• ' + fmt(R.activeInboxes) + ' inboxes sending, up to ' + fmt(R.activeCapacity) + ' emails a day');
      q.push('• ' + fmt(R.notActiveInboxes) + ' more inboxes warming up in reserve' + (R.reserveShort ? ', below our reserve target, so more are being added' : ''));
      q.push(attention ? '• ' + attention + ' sending domain(s) need attention this week and are being handled' : '• All sending domains look healthy this week');
    }
    out.push({ json: {
      channel: INFRA,
      text: '*DRAFT FOR ' + r.client.toUpperCase() + '* · for <#' + r.clientChannel + '> · send it there only once approved\n' + q.map(l => '> ' + l).join('\n'),
      client: r.client, kind: 'client draft',
    } });
  }
}
sd.messages = out.length;
if (!out.length) return [{ json: { _none: true } }];
return out;
