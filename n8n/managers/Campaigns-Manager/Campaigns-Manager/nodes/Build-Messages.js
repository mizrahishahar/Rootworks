// Build Messages: one Slack message per client, native Slack text, the same shape every day.
// One emoji per stage heading, one campaign per line: the name without its date in bold, the
// numbers in words, tags as inline code chips, the machine's own move at the end of the line.
// No code blocks: Slack wraps them at the client's width and a table in monospace is the least
// readable thing it can show. Empty sections are left out; a client with nothing in play gets
// no message.
const sd = $getWorkflowStaticData('global');
const CHANNEL = 'C0B8Q745KT8'; // #flowroots-campaigns
const S = sd.standard || { line: { Test: 1000, Scale: 3000 } };
const fmt = v => Number(v || 0).toLocaleString('en-US');
// "2026-08-24 - US DTC - Agent Demo - pitch-led" reads as "US DTC · Agent Demo · pitch-led".
const title = c => String(c.name || '').replace(/^\d{4}-\d{2}-\d{2}\s*-\s*/, '').split(/\s+-\s+/).join(' · ');
const chip = t => '`' + t + '`';
const tags = c => (c.tags || []).filter(t => t !== 'LINKEDIN').map(t => chip(t.replace(/^DRY since (\d{4})-(\d{2})-(\d{2})$/, (m, y, mo, d) => 'DRY since ' + d + '/' + mo))).join(' ');
const pos = c => c.positives === 1 ? '1 positive' : fmt(c.positives) + ' positives';
const rate = c => c.perPositive ? ' · 1 per ' + fmt(c.perPositive) : '';
const contacted = (c, line) => fmt(c.contacted) + (line ? ' / ' + fmt(line) : '') + ' contacted';

const row = (c, line, tail) => {
  const parts = [contacted(c, line), pos(c) + rate(c)];
  if (c.lane === 'LinkedIn') parts.push('LinkedIn');
  let s = '• *' + title(c) + '*\n      ' + parts.join(' · ');
  const t = tags(c); if (t) s += '   ' + t;
  if (tail) s += '   ' + tail;
  return s;
};

const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem' });
const out = [];
for (const R of sd.results || []) {
  const parts = ['*' + R.client.toUpperCase() + '*  ·  campaigns  ·  ' + today];
  const section = (head, rows) => { if (rows.length) parts.push('', head, ...rows); };
  section(':test_tube: *TEST*  in progress', R.testProgress.map(c => row(c, S.line.Test)));
  section(':test_tube: *TEST*  ready', R.testReady.map(c => row(c, null, c.verdict === 'killed' ? ':x: *killed*' : ':arrow_up: *moved to Scale*')));
  section(':rocket: *SCALE*  in progress', R.scaleProgress.map(c => row(c, S.line.Scale)));
  section(':rocket: *SCALE*  ready, best first', R.scaleReady.map(c => row(c, null, ':point_right: *Run or Killed*')));
  section(':large_green_circle: *RUN*', R.run.map(c => row(c, null)));
  section(':double_vertical_bar: *PAUSED BY HAND*', R.paused.map(c => row(c, null, '_set Killed or unpause_')));
  if (parts.length === 1) continue;
  out.push({ json: { channel: CHANNEL, text: parts.join('\n'), client: R.client } });
}
sd.messages = out.length;
if (!out.length) return [{ json: { _none: true } }];
return out;
