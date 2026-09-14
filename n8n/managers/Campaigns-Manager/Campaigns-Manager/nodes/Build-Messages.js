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
// One campaign is one card: its name in bold as Slack text with its tag beside it, then its own
// block. In progress and paused: one line of numbers. Run: the all-time row and the last weeks,
// row under row. Scale ready is a comparison, so it is one block for the whole phase, ranked.
const pos = c => c.positives === 1 ? '1 positive' : fmt(c.positives) + ' positives';
const chips = (c, tail) => [tagText(c) ? '`' + tagText(c).split(' · ').join('`  `') + '`' : '', tail ? '`' + tail + '`' : ''].filter(Boolean).join('  ');
const heading = (c, tail) => '*' + title(c) + '*' + (chips(c, tail) ? '   ' + chips(c, tail) : '');
const block = rows => '```\n' + rows.join('\n') + '\n```';
const numsLine = (c, over) => [fmt(c.contacted) + (over ? ' of ' + fmt(over) : '') + ' contacted', pos(c)].concat(c.perPositive ? ['1 per ' + fmt(c.perPositive)] : []).join('     ');
const card = (c, over, tail) => [heading(c, tail), block([numsLine(c, over)])].join('\n');
const runRow = (label, contacted, positives) => pad(label, 10) + rpad(fmt(contacted), 7) + ' contacted' + rpad(fmt(positives), 6) + (positives === 1 ? ' positive ' : ' positives') + (positives ? '     1 per ' + fmt(Math.round(contacted / positives)) : '');
const runCard = c => {
  const rows = [runRow('all time', c.contacted, c.positives)];
  if (c.weeks && c.weeks.length) for (const w of c.weeks) rows.push(runRow(w.label, w.contacted, w.positives));
  else rows.push('(no weekly series from this sender)');
  return [heading(c), block(rows)].join('\n');
};
// Scale ready: one block, best first, so the ranking reads as a table.
const rankedBlock = list => block(list.map((c, i) => rpad(String(i + 1) + '.', 3) + ' ' + pad(title(c), 42) + rpad('1 per ' + (c.perPositive ? fmt(c.perPositive) : 'none'), 14) + rpad(fmt(c.contacted) + ' contacted', 18) + rpad(pos(c), 14)));
const phase = (label, cards) => cards.length ? ['_' + label + '_', ''].concat(cards.map(x => x + '\n')) : ['_' + label + ':_ none'];

const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem' });
const out = [];
for (const R of sd.results || []) {
  const inPlay = R.testProgress.length + R.testReady.length + R.scaleProgress.length + R.scaleReady.length + R.run.length;
  if (!inPlay && !R.paused.length && !R.unmanaged.length) continue;
  for (const c of R.fed || []) if (!c.tags.includes('FED')) c.tags.push('FED');
  const parts = ['*' + R.client.toUpperCase() + '*  ·  ' + today + '  ·  ' + inPlay + ' in play  ·  ' + (R.fed || []).length + ' fed today'];
  parts.push('', ':test_tube: *TEST*');
  parts.push(...phase('in progress', R.testProgress.map(c => card(c, S.line.Test))));
  parts.push(...phase('ready', R.testReady.map(c => card(c, null, c.verdict === 'killed' ? 'KILLED' : 'MOVED TO SCALE'))));
  parts.push('', ':rocket: *SCALE*');
  parts.push(...phase('in progress', R.scaleProgress.map(c => card(c, S.line.Scale))));
  parts.push(...(R.scaleReady.length ? ['_ready, best first: Run or Killed_', rankedBlock(R.scaleReady)] : ['_ready:_ none']));
  parts.push('', ':large_green_circle: *RUN*', '');
  parts.push(...(R.run.length ? R.run.map(c => runCard(c) + '\n') : ['_none_']));
  parts.push('', ':double_vertical_bar: *PAUSED BY HAND*', '');
  parts.push(...(R.paused.length ? R.paused.map(c => card(c, null, 'set Killed or unpause') + '\n') : ['_none_']));
  if (R.unmanaged.length) {
    parts.push('', ':white_circle: *NO STAGE*', '_sending or paused on the sender, not managed until a Stage is set_', '');
    parts.push(...R.unmanaged.map(c => card(c, null, c.status === 'PAUSED' || c.status === 'COMPLETED' ? c.status.toLowerCase() + ', set a Stage or leave it' : 'set a Stage') + '\n'));
  }
  out.push({ json: { channel: CHANNEL, text: parts.join('\n').replace(/\n{3,}/g, '\n\n'), client: R.client } });
}
sd.messages = out.length;
if (!out.length) return [{ json: { _none: true } }];
return out;
