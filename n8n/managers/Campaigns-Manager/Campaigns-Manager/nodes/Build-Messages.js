// Build Messages: one Slack message per client. Stage headings as Slack text, each phase as its
// own monospace block kept under 80 columns so the client does not wrap it, every phase shown
// even when empty. A Run campaign gets its own small block: the all-time line, then the last
// weeks, so a stall reads as a falling column.
const sd = $getWorkflowStaticData('global');
const CHANNEL = 'C0B8Q745KT8'; // #flowroots-campaigns
const S = sd.standard || { line: { Test: 1000, Scale: 3000 } };
const fmt = v => Number(v || 0).toLocaleString('en-US');
const pad = (s, n) => { s = String(s == null ? '' : s); return s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n); };
const rpad = (s, n) => String(s == null ? '' : s).padStart(n);
// "2026-08-24 - US DTC - Agent Demo - pitch-led" reads as "US DTC, Agent Demo, pitch-led".
const title = c => String(c.name || '').replace(/^\d{4}-\d{2}-\d{2}\s*-\s*/, '').split(/\s+-\s+/).join(', ');
const tagText = c => (c.tags || []).filter(t => t !== 'LINKEDIN').map(t => t.replace(/^DRY since (\d{4})-(\d{2})-(\d{2})$/, (m, y, mo, d) => 'DRY ' + d + '/' + mo)).join(' · ');
const rate = c => c.perPositive ? '1 per ' + fmt(c.perPositive) : '';
const NAME = 34;

// One campaign, one line: name, contacted (with its line), positives, rate, tags.
const line = (c, over, tail) => {
  const contacted = fmt(c.contacted) + (over ? '/' + fmt(over) : '');
  let s = pad(title(c), NAME) + rpad(contacted, 13) + rpad(fmt(c.positives), 5) + '  ' + pad(rate(c), 12);
  const t = [tagText(c), tail].filter(Boolean).join('  ');
  return (s + (t ? ' ' + t : '')).replace(/\s+$/, '');
};
const header = pad('', NAME) + rpad('contacted', 13) + rpad('pos', 5) + '  ' + pad('rate', 12);
const block = rows => '```\n' + rows.join('\n') + '\n```';
const phase = (label, rows) => rows.length ? ['_' + label + '_', block([header].concat(rows))] : ['_' + label + ':_ none'];

// A Run campaign: its own block, all time on top, the weeks under it.
const runBlock = c => {
  const rows = [pad(title(c), 52) + (tagText(c) ? '  ' + tagText(c) : '')];
  const rowOf = (label, contacted, positives) => '  ' + pad(label, 9) + rpad(fmt(contacted), 9) + ' contacted' + rpad(fmt(positives), 6) + ' pos' + rpad(positives ? '1 per ' + fmt(Math.round(contacted / positives)) : '', 13);
  rows.push(rowOf('all time', c.contacted, c.positives));
  for (const w of c.weeks || []) rows.push(rowOf(w.label, w.contacted, w.positives));
  if (!c.weeks) rows.push('  (no weekly series from this sender)');
  return block(rows);
};

const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem' });
const out = [];
for (const R of sd.results || []) {
  const inPlay = R.testProgress.length + R.testReady.length + R.scaleProgress.length + R.scaleReady.length + R.run.length;
  if (!inPlay && !R.paused.length) continue;
  const parts = ['*' + R.client.toUpperCase() + '*  ·  ' + today + '  ·  ' + inPlay + ' in play'];
  parts.push('', ':test_tube: *TEST*');
  parts.push(...phase('in progress', R.testProgress.map(c => line(c, S.line.Test))));
  parts.push(...phase('ready', R.testReady.map(c => line(c, null, c.verdict === 'killed' ? '→ killed' : '→ Scale'))));
  parts.push('', ':rocket: *SCALE*');
  parts.push(...phase('in progress', R.scaleProgress.map(c => line(c, S.line.Scale))));
  parts.push(...phase('ready, best first', R.scaleReady.map(c => line(c, null, '→ Run or Killed'))));
  parts.push('', ':large_green_circle: *RUN*');
  if (R.run.length) for (const c of R.run) parts.push(runBlock(c)); else parts.push('_none_');
  parts.push('', ':double_vertical_bar: *PAUSED BY HAND*');
  parts.push(...(R.paused.length ? [block([header].concat(R.paused.map(c => line(c, null, 'set Killed or unpause'))))] : ['_none_']));
  out.push({ json: { channel: CHANNEL, text: parts.join('\n'), client: R.client } });
}
sd.messages = out.length;
if (!out.length) return [{ json: { _none: true } }];
return out;
