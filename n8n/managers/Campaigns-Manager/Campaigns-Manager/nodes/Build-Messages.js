// Build Messages: one Slack message per client, as Block Kit. A header, then per stage a
// heading and, per campaign, a card: the name in bold and a two-column grid of its numbers.
// Every stage is shown, empty ones say so, so a missing section is never silent. Slack cannot
// render a markdown table; the field grid is the structured thing it can render.
const sd = $getWorkflowStaticData('global');
const CHANNEL = 'C0B8Q745KT8'; // #flowroots-campaigns
const S = sd.standard || { line: { Test: 1000, Scale: 3000 } };
const fmt = v => Number(v || 0).toLocaleString('en-US');
// "2026-08-24 - US DTC - Agent Demo - pitch-led" reads as "US DTC, Agent Demo, pitch-led".
const title = c => String(c.name || '').replace(/^\d{4}-\d{2}-\d{2}\s*-\s*/, '').split(/\s+-\s+/).join(', ');
const md = text => ({ type: 'mrkdwn', text });
const tagText = c => (c.tags || []).filter(t => t !== 'LINKEDIN').map(t => t.replace(/^DRY since (\d{4})-(\d{2})-(\d{2})$/, (m, y, mo, d) => 'DRY since ' + d + '/' + mo)).map(t => '`' + t + '`').join('  ');

const card = (c, line, move) => {
  const fields = [
    md('*Contacted*\n' + fmt(c.contacted) + (line ? ' of ' + fmt(line) : '')),
    md('*Positive replies*\n' + fmt(c.positives) + (c.perPositive ? '  (1 per ' + fmt(c.perPositive) + ')' : '')),
  ];
  const flags = tagText(c);
  if (flags || move) fields.push(md('*Flags*\n' + (flags || 'none')));
  if (move) fields.push(md('*Next*\n' + move));
  if (c.lane === 'LinkedIn' && !move) fields.push(md('*Channel*\nLinkedIn'));
  return { type: 'section', text: md('*' + title(c) + '*'), fields };
};
const heading = (emoji, name) => ({ type: 'section', text: md(emoji + ' *' + name + '*') });
const sub = (label, rows) => rows.length ? [{ type: 'context', elements: [md('_' + label + '_')] }].concat(rows) : [{ type: 'context', elements: [md('_' + label + ':_ none')] }];

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Jerusalem' });
const out = [];
for (const R of sd.results || []) {
  const inPlay = R.testProgress.length + R.testReady.length + R.scaleProgress.length + R.scaleReady.length + R.run.length;
  if (!inPlay && !R.paused.length) continue;
  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: R.client + '  ·  campaigns', emoji: true } },
    { type: 'context', elements: [md(today + '  ·  ' + inPlay + ' in play')] },
    { type: 'divider' },
    heading(':test_tube:', 'TEST'),
    ...sub('in progress', R.testProgress.map(c => card(c, S.line.Test))),
    ...sub('ready', R.testReady.map(c => card(c, null, c.verdict === 'killed' ? ':x: killed' : ':arrow_up: moved to Scale'))),
    { type: 'divider' },
    heading(':rocket:', 'SCALE'),
    ...sub('in progress', R.scaleProgress.map(c => card(c, S.line.Scale))),
    ...sub('ready, best first', R.scaleReady.map(c => card(c, null, ':point_right: Run or Killed'))),
    { type: 'divider' },
    heading(':large_green_circle:', 'RUN'),
    ...(R.run.length ? R.run.map(c => card(c, null)) : [{ type: 'context', elements: [md('_none_')] }]),
    { type: 'divider' },
    heading(':double_vertical_bar:', 'PAUSED BY HAND'),
    ...(R.paused.length ? R.paused.map(c => card(c, null, 'set Killed or unpause')) : [{ type: 'context', elements: [md('_none_')] }]),
  ];
  // Slack caps a message at 50 blocks; a client with more campaigns than that gets the first 50 and a note.
  const capped = blocks.length > 50 ? blocks.slice(0, 49).concat([{ type: 'context', elements: [md('_' + (blocks.length - 49) + ' more blocks not shown_')] }]) : blocks;
  out.push({ json: { channel: CHANNEL, text: R.client + ': campaigns, ' + today, blocks: capped, client: R.client } });
}
sd.messages = out.length;
if (!out.length) return [{ json: { _none: true } }];
return out;
