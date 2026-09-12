// Build Messages: one Slack message per client, the same shape every day. Bold stage headers,
// code blocks with aligned columns, tags at the end of a line. Empty sections are left out; a
// client with nothing in play gets no message.
const sd = $getWorkflowStaticData('global');
const CHANNEL = 'C0B8Q745KT8'; // #flowroots-campaigns
const S = sd.standard || { line: { Test: 1000, Scale: 3000 } };
const fmt = v => Number(v || 0).toLocaleString('en-US');
const pad = (s, n) => { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n); };
const rpad = (s, n) => String(s == null ? '' : s).padStart(n);
const tags = c => c.tags && c.tags.length ? '  [' + c.tags.join('] [') + ']' : '';
const per = c => c.perPositive ? '1 per ' + fmt(c.perPositive) : '';

const NAME = 58;
const line = (c, over) => pad(c.name, NAME) + '  ' + pad(c.sender, 11) + rpad(fmt(c.contacted) + (over ? ' / ' + fmt(over) : ''), 15) + rpad(fmt(c.positives), 5) + '  ' + pad(per(c), 12) + tags(c);
const readyLine = c => pad(c.name, NAME) + '  ' + pad(c.sender, 11) + rpad(fmt(c.contacted), 15) + rpad(fmt(c.positives), 5) + '  ' + pad(per(c), 12) + (c.verdict ? '  ' + c.verdict : '') + tags(c);
const block = rows => '```\n' + rows.join('\n') + '\n```';
const header = pad('campaign', NAME) + '  ' + pad('sender', 11) + rpad('contacted', 15) + rpad('pos', 5) + '  ' + pad('rate', 12);

const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem' });
const out = [];
for (const R of sd.results || []) {
  const parts = ['*' + R.client.toUpperCase() + ' · campaigns · ' + today + '*'];
  if (R.testProgress.length) parts.push('*TEST · in progress*', block([header].concat(R.testProgress.map(c => line(c, S.line.Test)))));
  if (R.testReady.length) parts.push('*TEST · ready*', block(R.testReady.map(readyLine)));
  if (R.scaleProgress.length) parts.push('*SCALE · in progress*', block([header].concat(R.scaleProgress.map(c => line(c, S.line.Scale)))));
  if (R.scaleReady.length) parts.push('*SCALE · ready, ranked*', block([header].concat(R.scaleReady.map(readyLine))));
  if (R.run.length) parts.push('*RUN*', block([header].concat(R.run.map(c => line(c)))));
  if (R.paused.length) parts.push('*PAUSED BY HAND*', block(R.paused.map(c => pad(c.name, NAME) + '  ' + pad(c.sender, 11) + rpad(fmt(c.contacted), 15) + rpad(fmt(c.positives), 5) + '  ' + pad(per(c), 12) + '  set Killed or unpause')));
  if (parts.length === 1) continue;
  R.messageLines = parts.length - 1;
  out.push({ json: { channel: CHANNEL, text: parts.join('\n'), client: R.client } });
}
sd.messages = out.length;
if (!out.length) return [{ json: { _none: true } }];
return out;
