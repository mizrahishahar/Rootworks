const ws = $('Loop Over Workspaces').item.json;
const workspaceName = ws.name;
const workspaceId = ws.id;
const life = $('Stats Lifetime').all().map(function(i){ return i.json; });
const camps = $('Campaign List').all().map(function(i){ return i.json; });
const replyPages = $('Get Replies (paginated)').all().map(function(i){ return i.json; });

const allMessages = [];
for (const p of replyPages) {
  const arr = Array.isArray(p && p.data) ? p.data : [];
  for (const e of arr) allMessages.push(e);
}

function tsMs(e) {
  if (e.timestamp_created) return new Date(e.timestamp_created).getTime();
  if (e.source_modified_at) return new Date(e.source_modified_at).getTime();
  return 0;
}

const KEEP = function(c){ return c.status === 'ACTIVE' || c.status === 'COMPLETED'; };
const keptCamps = camps.filter(KEEP);
const activeCamps = camps.filter(function(c){ return c.status === 'ACTIVE'; });
const keptIds = {};
for (const c of keptCamps) { keptIds[c._id || c.id] = true; }

const byThread = {};
for (const e of allMessages) {
  const cid = e.campaign_id || 'none';
  if (!keptIds[cid]) continue;
  const tid = e.thread_id || e.source_thread_id || ((e.lead_id || e.lead || 'x') + ':' + cid);
  const existing = byThread[tid];
  if (!existing || tsMs(e) > tsMs(existing)) byThread[tid] = e;
}
const allReplies = Object.values(byThread);

const POSITIVE_LABELS = ['INTERESTED','MEETING_BOOKED','MEETING_REQUEST','POSITIVE_REPLY'];
const OOO_LABELS = ['OUT_OF_OFFICE'];
const INFO_LABELS = ['INFORMATION_REQUEST'];
const WRONG_LABELS = ['WRONG_PERSON'];
const NEGATIVE_LABELS = ['NOT_INTERESTED'];

function labelBucket(l) {
  if (!l) return 'other';
  if (POSITIVE_LABELS.indexOf(l) > -1) return 'positive';
  if (OOO_LABELS.indexOf(l) > -1) return 'ooo';
  if (INFO_LABELS.indexOf(l) > -1) return 'info';
  if (WRONG_LABELS.indexOf(l) > -1) return 'wrong';
  if (NEGATIVE_LABELS.indexOf(l) > -1) return 'negative';
  return 'other';
}

const replyByCamp = {};
for (const e of allReplies) {
  const cid = e.campaign_id || 'none';
  if (!replyByCamp[cid]) replyByCamp[cid] = { total: 0, positive: 0, ooo: 0, info: 0, wrong: 0, negative: 0, other: 0 };
  const b = labelBucket(e.label);
  replyByCamp[cid].total++;
  replyByCamp[cid][b]++;
}

const lifeById = {};
for (const c of life) { if (c && c._id) lifeById[c._id] = c; }

function pct(n, d) { if (!d || d === 0) return null; return (n / d) * 100; }
function fmtPct(p, dec) { if (p === null || p === undefined || isNaN(p)) return 'n/a'; return p.toFixed(dec === undefined ? 2 : dec) + '%'; }
function fmtNum(n) { if (n === null || n === undefined) return '0'; return Number(n).toLocaleString('en-US'); }

const totals = { sent: 0, replies: 0, positive: 0, ooo: 0, info: 0, wrong: 0, negative: 0, other: 0 };
for (const c of keptCamps) {
  const stats = lifeById[c._id || c.id] || {};
  totals.sent += (stats.sent_count || 0);
  const r = replyByCamp[c._id || c.id] || { total: 0, positive: 0, ooo: 0, info: 0, wrong: 0, negative: 0, other: 0 };
  totals.replies += r.total;
  totals.positive += r.positive;
  totals.ooo += r.ooo;
  totals.info += r.info;
  totals.wrong += r.wrong;
  totals.negative += r.negative;
  totals.other += r.other;
}

const replyPct = pct(totals.replies, totals.sent);
const posPerSent = pct(totals.positive, totals.sent);

const T = { noise: 2000, infraOnly: 5000, mature: 10000, replyOk: 2, replyWarn: 1, posOk: 0.5, posWarn: 0.15 };
function tier(sent) {
  if (sent < T.noise) return { key: 'noise', label: 'Noise (under 2k)' };
  if (sent < T.infraOnly) return { key: 'infraOnly', label: 'Infra-only (2k-5k)' };
  if (sent < T.mature) return { key: 'live', label: 'Live / list zone (5k-10k)' };
  return { key: 'mature', label: 'Mature / copy zone (10k+)' };
}
function replyBand(r, tk) {
  if (tk === 'noise') return { icon: ':hourglass:', label: 'noise' };
  if (r === null) return { icon: ':hourglass:', label: 'no data' };
  if (r >= T.replyOk) return { icon: ':white_check_mark:', label: 'ok (\u22652%)' };
  if (r >= T.replyWarn) return { icon: ':warning:', label: 'warning (1-2%)' };
  return { icon: ':x:', label: 'error (<1%)' };
}
function posBand(r, tk) {
  if (tk === 'noise' || tk === 'infraOnly') return { icon: ':hourglass:', label: 'noise (need 5k+)' };
  if (r === null) return { icon: ':hourglass:', label: 'no data' };
  if (r >= T.posOk) return { icon: ':white_check_mark:', label: 'ok (\u22650.5%)' };
  if (r >= T.posWarn) return { icon: ':warning:', label: 'warning (0.15-0.5%)' };
  return { icon: ':x:', label: 'error (<0.15%)' };
}

const wsTier = tier(totals.sent);
const wsReplyBand = replyBand(replyPct, wsTier.key);
const wsPosBand = posBand(posPerSent, wsTier.key);

const diagnosis = [];
if (wsTier.key === 'noise') diagnosis.push('Workspace below 2k sent: not enough volume to diagnose. Send more.');
else {
  if (wsReplyBand.label.indexOf('error') > -1 || wsReplyBand.label.indexOf('warning') > -1) {
    if (wsTier.key === 'infraOnly') diagnosis.push('Reply rate ' + fmtPct(replyPct) + ' below target but in 2k-5k zone. Cross-check Infra Digest first.');
    else diagnosis.push('Reply rate ' + fmtPct(replyPct) + ' under target. Order: infra \u2192 list \u2192 copy.');
  } else if (wsReplyBand.label.indexOf('ok') > -1) diagnosis.push('Reply rate on target. Keep sending.');
  if (wsTier.key === 'live' || wsTier.key === 'mature') {
    if (wsPosBand.label.indexOf('error') > -1) diagnosis.push('Positive rate ' + fmtPct(posPerSent) + ' critically low. Offer/ICP mismatch likely.');
    else if (wsPosBand.label.indexOf('warning') > -1) diagnosis.push('Positive rate ' + fmtPct(posPerSent) + ' below 0.5% target. Watch next week.');
  }
}
if (totals.ooo > 0) diagnosis.push('OOO threads: ' + totals.ooo + ' (' + fmtPct(pct(totals.ooo, totals.sent)) + ' of sends). Healthy noise ~1-2%.');
if (diagnosis.length === 0) diagnosis.push('No diagnostic at workspace level.');

const today = new Date().toISOString().slice(0,10);

const legend = ['*\ud83d\udcda KPI Reference*','','*Tiers (lifetime sent)*','`<2k` Noise  \u2022  `2k-5k` Infra-only  \u2022  `5k-10k` Live  \u2022  `10k+` Mature','','*Reply rate*  `\u22652%` ok  \u2022  `1-2%` warning  \u2022  `<1%` error','*Positive per sent*  `\u22650.5%` ok  \u2022  `0.15-0.5%` warning  \u2022  `<0.15%` error  (at 5k+)','','_Replies = unique threads (deduped by thread_id, latest message label). Includes OOO + all categorized labels._','*Order:* infra \u2192 list \u2192 copy. Bounce in Infra Digest.'].join('\n');

const blocks = [
  { type: 'header', text: { type: 'plain_text', text: 'Campaign Digest \u2014 ' + today, emoji: true } },
  { type: 'section', text: { type: 'mrkdwn', text: '*' + workspaceName + '*' } },
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*\ud83c\udfaf Workspace totals (lifetime, ACTIVE + COMPLETED, deduped by thread)*' } },
  { type: 'section', fields: [
    { type: 'mrkdwn', text: '*Active campaigns*\n`' + activeCamps.length + '`' },
    { type: 'mrkdwn', text: '*Active + completed*\n`' + keptCamps.length + '`' },
    { type: 'mrkdwn', text: '*Sends*\n`' + fmtNum(totals.sent) + '`' },
    { type: 'mrkdwn', text: '*Replies (unique threads)*\n`' + fmtNum(totals.replies) + ' (' + fmtPct(replyPct) + ')`' },
    { type: 'mrkdwn', text: '*Positive replies*\n`' + fmtNum(totals.positive) + ' (' + fmtPct(posPerSent) + ' per sent)`' },
    { type: 'mrkdwn', text: '*OOO*\n`' + fmtNum(totals.ooo) + '` \u2022 *Negative*\n`' + fmtNum(totals.negative) + '` \u2022 *Other*\n`' + fmtNum(totals.other + totals.info + totals.wrong) + '`' }
  ]},
  { type: 'section', text: { type: 'mrkdwn', text: '*Workspace KPI bands*\nReply rate: ' + wsReplyBand.icon + '  ' + fmtPct(replyPct) + '  (' + wsReplyBand.label + ')\nPositive rate: ' + wsPosBand.icon + '  ' + fmtPct(posPerSent) + '  (' + wsPosBand.label + ')\nTier: ' + wsTier.label } },
  { type: 'section', text: { type: 'mrkdwn', text: '*\ud83d\udd0e Workspace diagnosis*\n' + diagnosis.map(function(d){ return '\u2022 ' + d; }).join('\n') } },
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: legend } },
  { type: 'divider' }
];

blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '*\ud83d\udd0d Active campaigns (' + activeCamps.length + ') \u2014 numbers only*' } });
if (activeCamps.length === 0) blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '_no active campaigns_' } });

const activeWithStats = activeCamps.map(function(c){
  const id = c._id || c.id;
  const s = lifeById[id] || {};
  const r = replyByCamp[id] || { total: 0, positive: 0, ooo: 0, negative: 0 };
  const sent = s.sent_count || 0;
  return { name: c.name || s.camp_name || id, sent: sent, replies: r.total, positive: r.positive, ooo: r.ooo, negative: r.negative, replyPct: pct(r.total, sent), posPct: pct(r.positive, sent) };
});
activeWithStats.sort(function(a,b){ return (b.sent || 0) - (a.sent || 0); });

for (const c of activeWithStats) {
  const head = '*' + c.name + '*';
  const lines = [head,
    '`Sent` ' + fmtNum(c.sent) + '  \u2022  `Replies` ' + fmtNum(c.replies) + ' (' + fmtPct(c.replyPct) + ')  \u2022  `Positives` ' + fmtNum(c.positive) + ' (' + fmtPct(c.posPct) + ')',
    '`OOO` ' + fmtNum(c.ooo) + '  \u2022  `Negative` ' + fmtNum(c.negative)
  ];
  blocks.push({ type: 'section', text: { type: 'mrkdwn', text: lines.join('\n') } });
}

blocks.push({ type: 'divider' });
blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: '_Reply counts deduped by `thread_id`. DRAFT excluded._' }]});

let md = '# Campaign Digest \u2014 ' + today + '\n\n';
md += '**Workspace:** ' + workspaceName + '  \n';
md += '**Active campaigns:** ' + activeCamps.length + '  \n';
md += '**Active + completed:** ' + keptCamps.length + '  \n';
md += '**Workspace tier:** ' + wsTier.label + '\n\n';
md += '## Workspace totals (lifetime, ACTIVE + COMPLETED, deduped by thread)\n\n';
md += '| Metric | Value | Band |\n';
md += '|---|---|---|\n';
md += '| Sends | ' + fmtNum(totals.sent) + ' | \u2014 |\n';
md += '| Replies (unique threads) | ' + fmtNum(totals.replies) + ' (' + fmtPct(replyPct) + ') | ' + wsReplyBand.label + ' |\n';
md += '| Positive replies | ' + fmtNum(totals.positive) + ' (' + fmtPct(posPerSent) + ' per sent) | ' + wsPosBand.label + ' |\n';
md += '| OOO | ' + fmtNum(totals.ooo) + ' | \u2014 |\n';
md += '| Negative | ' + fmtNum(totals.negative) + ' | \u2014 |\n';
md += '| Other (info/wrong/uncategorized) | ' + fmtNum(totals.other + totals.info + totals.wrong) + ' | \u2014 |\n\n';
md += '## Workspace diagnosis\n\n';
for (const d of diagnosis) md += '- ' + d + '\n';
md += '\n';
md += '## KPI bands reference\n\n';
md += '- **Tiers (lifetime sent)**: <2k Noise, 2k-5k Infra-only, 5k-10k Live, 10k+ Mature\n';
md += '- **Reply rate**: \u22652% ok, 1-2% warning, <1% error\n';
md += '- **Positive per sent**: \u22650.5% ok, 0.15-0.5% warning, <0.15% error (judged at 5k+)\n';
md += '- Replies = unique threads (deduped by `thread_id`, latest message label). Includes OOO + all categorized labels.\n';
md += '- Order: infra \u2192 list \u2192 copy. Bounce in Infra Digest.\n\n';
md += '## Active campaigns (' + activeCamps.length + ') \u2014 numbers only\n\n';
if (activeCamps.length === 0) md += '_No active campaigns._\n\n';
else {
  md += '| Campaign | Sent | Replies | Reply % | Positives | Positive % | OOO | Negative |\n';
  md += '|---|---|---|---|---|---|---|---|\n';
  for (const c of activeWithStats) {
    md += '| `' + c.name + '` | ' + fmtNum(c.sent) + ' | ' + fmtNum(c.replies) + ' | ' + fmtPct(c.replyPct) + ' | ' + fmtNum(c.positive) + ' | ' + fmtPct(c.posPct) + ' | ' + fmtNum(c.ooo) + ' | ' + fmtNum(c.negative) + ' |\n';
  }
  md += '\n';
}
md += '---\n_Generated by Flowroots n8n \u2014 Daily Campaign Digest._\n';

const fallback = 'Campaign Digest (' + workspaceName + '): ' + activeCamps.length + ' active, ' + fmtNum(totals.sent) + ' sent, ' + totals.positive + ' positive';
return [{ json: { blocks: JSON.stringify({ blocks: blocks }), fallback: fallback, workspace_name: workspaceName, workspace_id: workspaceId, markdown: md } }];