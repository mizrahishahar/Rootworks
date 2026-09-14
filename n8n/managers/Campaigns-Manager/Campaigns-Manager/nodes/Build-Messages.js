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
// One campaign is one unit, the same in every stage: the name on its own line, never cut; the
// numbers on the line under it in words; a Run campaign adds a third line, its last weeks.
const pos = c => c.positives === 1 ? '1 positive' : fmt(c.positives) + ' positives';
const unit = (c, over, tail) => {
  const nums = [fmt(c.contacted) + (over ? ' of ' + fmt(over) : '') + ' contacted', pos(c)];
  if (c.perPositive) nums.push('1 per ' + fmt(c.perPositive));
  const t = [tagText(c), tail].filter(Boolean).join('   ');
  const rows = [title(c), '    ' + nums.join('     ') + (t ? '     ' + t : '')];
  if (c.stage === 'Run') {
    if (c.weeks && c.weeks.length) rows.push('    ' + c.weeks.map(w => w.label + '  ' + fmt(w.contacted) + ' / ' + fmt(w.positives)).join('      '));
    else rows.push('    (no weekly series from this sender)');
  }
  return rows.join('\n');
};
const block = units => '```\n' + units.join('\n\n') + '\n```';
const phase = (label, units) => units.length ? ['_' + label + '_', block(units)] : ['_' + label + ':_ none'];

const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem' });
const out = [];
for (const R of sd.results || []) {
  const inPlay = R.testProgress.length + R.testReady.length + R.scaleProgress.length + R.scaleReady.length + R.run.length;
  if (!inPlay && !R.paused.length) continue;
  const parts = ['*' + R.client.toUpperCase() + '*  ·  ' + today + '  ·  ' + inPlay + ' in play'];
  parts.push('', ':test_tube: *TEST*');
  parts.push(...phase('in progress', R.testProgress.map(c => unit(c, S.line.Test))));
  parts.push(...phase('ready', R.testReady.map(c => unit(c, null, c.verdict === 'killed' ? 'KILLED' : 'MOVED TO SCALE'))));
  parts.push('', ':rocket: *SCALE*');
  parts.push(...phase('in progress', R.scaleProgress.map(c => unit(c, S.line.Scale))));
  parts.push(...phase('ready, best first', R.scaleReady.map(c => unit(c, null, 'RUN OR KILLED'))));
  parts.push('', ':large_green_circle: *RUN*');
  parts.push(R.run.length ? block(R.run.map(c => unit(c, null))) : '_none_');
  parts.push('', ':double_vertical_bar: *PAUSED BY HAND*');
  parts.push(R.paused.length ? block(R.paused.map(c => unit(c, null, 'set Killed or unpause'))) : '_none_');
  out.push({ json: { channel: CHANNEL, text: parts.join('\n'), client: R.client } });
}
sd.messages = out.length;
if (!out.length) return [{ json: { _none: true } }];
return out;
