const ws = $('Loop Over Workspaces').item.json;
const workspaceName = ws.name;
const workspaceId = ws.id;
const l7d = $('Stats Last 7d').all().map(function(i){ return i.json; });
const p7d = $('Stats Prior 7d').all().map(function(i){ return i.json; });
const camps = $('Campaign List').all().map(function(i){ return i.json; });
const replyPages = $('Get Replies (paginated)').all().map(function(i){ return i.json; });

const KEEP = function(c){ return c.status === 'ACTIVE' || c.status === 'COMPLETED'; };
const keptCamps = camps.filter(KEEP);
const keptIds = {};
for (const c of keptCamps) { keptIds[c._id || c.id] = true; }
const activeCount = camps.filter(function(c){ return c.status === 'ACTIVE'; }).length;

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

const byThread = {};
for (const e of allMessages) {
  const cid = e.campaign_id || 'none';
  if (!keptIds[cid]) continue;
  const tid = e.thread_id || e.source_thread_id || ((e.lead_id || e.lead || 'x') + ':' + cid);
  const existing = byThread[tid];
  if (!existing || tsMs(e) > tsMs(existing)) byThread[tid] = e;
}
const allReplies = Object.values(byThread);

const nowMs = Date.now();
const day = 24*60*60*1000;
const weekStart = nowMs - 7 * day;
const priorStart = nowMs - 14 * day;
const priorEnd = nowMs - 7 * day;

const POSITIVE = ['INTERESTED','MEETING_BOOKED','MEETING_REQUEST','POSITIVE_REPLY'];
const OOO = ['OUT_OF_OFFICE'];
function bucket(l) {
  if (POSITIVE.indexOf(l) > -1) return 'positive';
  if (OOO.indexOf(l) > -1) return 'ooo';
  if (l === 'NOT_INTERESTED') return 'negative';
  if (l === 'INFORMATION_REQUEST') return 'info';
  if (l === 'WRONG_PERSON') return 'wrong';
  return 'other';
}

const weekR = { total: 0, positive: 0, ooo: 0, negative: 0, info: 0, wrong: 0, other: 0 };
const priorR = { total: 0, positive: 0, ooo: 0, negative: 0, info: 0, wrong: 0, other: 0 };
const perCampaignWeek = {};
for (const e of allReplies) {
  const cid = e.campaign_id || 'none';
  if (!keptIds[cid]) continue;
  const ts = tsMs(e);
  const b = bucket(e.label);
  if (ts >= weekStart) {
    weekR.total++;
    weekR[b]++;
    if (!perCampaignWeek[cid]) perCampaignWeek[cid] = { total: 0, positive: 0, ooo: 0, negative: 0, info: 0, wrong: 0, other: 0 };
    perCampaignWeek[cid].total++;
    perCampaignWeek[cid][b]++;
  } else if (ts >= priorStart && ts < priorEnd) {
    priorR.total++;
    priorR[b]++;
  }
}

const weekSent = l7d.filter(function(c){ return keptIds[c._id]; }).reduce(function(s,c){ return s + (c.sent_count || 0); }, 0);
const priorSent = p7d.filter(function(c){ return keptIds[c._id]; }).reduce(function(s,c){ return s + (c.sent_count || 0); }, 0);

function pct(n, d) { if (!d || d === 0) return null; return (n / d) * 100; }
function fmtPct(p, dec) { if (p === null || p === undefined || isNaN(p)) return 'n/a'; return p.toFixed(dec === undefined ? 2 : dec) + '%'; }
function fmtNum(n) { return Number(n || 0).toLocaleString('en-US'); }
function arrow(now, prior) {
  if (prior === null || prior === undefined) return '';
  const delta = (now || 0) - prior;
  if (delta === 0) return '  :left_right_arrow:';
  return delta > 0 ? '  :arrow_upper_right: +' + delta : '  :arrow_lower_right: ' + delta;
}
function deltaTxt(now, prior) {
  if (prior === null || prior === undefined) return '-';
  const d = (now || 0) - prior;
  if (d === 0) return '0';
  return d > 0 ? '+' + d : '' + d;
}

const weekReplyPct = pct(weekR.total, weekSent);
const weekPosPerSent = pct(weekR.positive, weekSent);
const priorReplyPct = pct(priorR.total, priorSent);
const priorPosPerSent = pct(priorR.positive, priorSent);
const today = new Date().toISOString().slice(0, 10);

const clientBlocks = [
  { type: 'header', text: { type: 'plain_text', text: 'Weekly Update — ' + today, emoji: true } },
  { type: 'section', text: { type: 'mrkdwn', text: '*' + workspaceName + '*  —  client-facing template' } },
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*This week vs last week*' } },
  { type: 'section', fields: [
    { type: 'mrkdwn', text: '*Active campaigns*\n`' + activeCount + '`' },
    { type: 'mrkdwn', text: '*Emails sent*\n`' + fmtNum(weekSent) + '`' + arrow(weekSent, priorSent) },
    { type: 'mrkdwn', text: '*Replies* (unique threads incl OOO)\n`' + fmtNum(weekR.total) + ' (' + fmtPct(weekReplyPct) + ')`' + arrow(weekR.total, priorR.total) },
    { type: 'mrkdwn', text: '*Positive replies*\n`' + fmtNum(weekR.positive) + ' (' + fmtPct(weekPosPerSent) + ')`' + arrow(weekR.positive, priorR.positive) },
    { type: 'mrkdwn', text: '*Bookings*\n`{FILL}`' },
    { type: 'mrkdwn', text: '*Booking rate (from positives)*\n`{FILL}`' }
  ]},
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*📝 Analysis*\n_{client-success-lead skill fills this}_' } },
  { type: 'section', text: { type: 'mrkdwn', text: '*🎯 Next steps*\n_{client-success-lead skill fills this}_' } },
  { type: 'context', elements: [{ type: 'mrkdwn', text: '_Fill bookings + paragraphs. Edit then schedule-send Monday._' }]}
];
const clientFallback = 'Weekly client (' + workspaceName + '): ' + weekR.positive + ' positive, ' + fmtNum(weekSent) + ' sent';

const rankedCamps = keptCamps.map(function(c){
  const id = c._id || c.id;
  const stats = l7d.find(function(s){ return s._id === id; }) || {};
  const r = perCampaignWeek[id] || { total: 0, positive: 0, ooo: 0, negative: 0 };
  const sent = stats.sent_count || 0;
  return { name: c.name || stats.camp_name || id, status: c.status, sent: sent, replies: r.total, positive: r.positive, ooo: r.ooo, negative: r.negative, replyPct: pct(r.total, sent), posPct: pct(r.positive, sent) };
});
rankedCamps.sort(function(a,b){ if (b.positive !== a.positive) return b.positive - a.positive; return (b.posPct || 0) - (a.posPct || 0); });

const internalBlocks = [
  { type: 'header', text: { type: 'plain_text', text: 'Internal Weekly — ' + today, emoji: true } },
  { type: 'section', text: { type: 'mrkdwn', text: '*' + workspaceName + '*  —  internal report' } },
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*This week vs last week (ACTIVE + COMPLETED)*' } },
  { type: 'section', fields: [
    { type: 'mrkdwn', text: '*Active campaigns*\n`' + activeCount + '`' },
    { type: 'mrkdwn', text: '*Sent*\n`' + fmtNum(weekSent) + '`' + arrow(weekSent, priorSent) },
    { type: 'mrkdwn', text: '*Replies (incl OOO)*\n`' + fmtNum(weekR.total) + ' (' + fmtPct(weekReplyPct) + ')`' + arrow(weekR.total, priorR.total) },
    { type: 'mrkdwn', text: '*Positives*\n`' + fmtNum(weekR.positive) + ' (' + fmtPct(weekPosPerSent) + ')`' + arrow(weekR.positive, priorR.positive) },
    { type: 'mrkdwn', text: '*OOO*\n`' + fmtNum(weekR.ooo) + '`' + arrow(weekR.ooo, priorR.ooo) },
    { type: 'mrkdwn', text: '*Negative*\n`' + fmtNum(weekR.negative) + '`' + arrow(weekR.negative, priorR.negative) }
  ]},
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: '*🏆 Campaign ranking (by positives → positive rate)*' } }
];
if (rankedCamps.length === 0) internalBlocks.push({ type: 'section', text: { type: 'mrkdwn', text: '_no campaigns_' } });
let rank = 1;
for (const c of rankedCamps) {
  if (c.sent === 0 && c.positive === 0 && c.replies === 0) continue;
  const medal = rank === 1 ? ':1st_place_medal:' : rank === 2 ? ':2nd_place_medal:' : rank === 3 ? ':3rd_place_medal:' : '`#' + rank + '`';
  const head = medal + '  *' + c.name + '*  —  ' + (c.status || '?');
  const line = '`Sent` ' + fmtNum(c.sent) + '  •  `Replies` ' + fmtNum(c.replies) + ' (' + fmtPct(c.replyPct) + ')  •  *`Positives` ' + fmtNum(c.positive) + ' (' + fmtPct(c.posPct) + ')*\n`OOO` ' + fmtNum(c.ooo) + '  •  `Negative` ' + fmtNum(c.negative);
  internalBlocks.push({ type: 'section', text: { type: 'mrkdwn', text: head + '\n' + line } });
  rank++;
}
internalBlocks.push({ type: 'divider' });
internalBlocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: '_Replies deduped by thread_id._' }]});
const internalFallback = 'Internal weekly (' + workspaceName + '): ' + weekR.positive + ' positives';

let md = '# Weekly KPI Report — ' + today + '\n\n';
md += '**Workspace:** ' + workspaceName + '\n\n';
md += '## This week vs last week (ACTIVE + COMPLETED)\n\n';
md += '| Metric | This week | Last week | Δ |\n';
md += '|---|---|---|---|\n';
md += '| Active campaigns | ' + activeCount + ' | - | - |\n';
md += '| Emails sent | ' + fmtNum(weekSent) + ' | ' + fmtNum(priorSent) + ' | ' + deltaTxt(weekSent, priorSent) + ' |\n';
md += '| Replies (incl OOO) | ' + fmtNum(weekR.total) + ' (' + fmtPct(weekReplyPct) + ') | ' + fmtNum(priorR.total) + ' (' + fmtPct(priorReplyPct) + ') | ' + deltaTxt(weekR.total, priorR.total) + ' |\n';
md += '| Positive replies | ' + fmtNum(weekR.positive) + ' (' + fmtPct(weekPosPerSent) + ') | ' + fmtNum(priorR.positive) + ' (' + fmtPct(priorPosPerSent) + ') | ' + deltaTxt(weekR.positive, priorR.positive) + ' |\n';
md += '| OOO | ' + fmtNum(weekR.ooo) + ' | ' + fmtNum(priorR.ooo) + ' | ' + deltaTxt(weekR.ooo, priorR.ooo) + ' |\n';
md += '| Negative | ' + fmtNum(weekR.negative) + ' | ' + fmtNum(priorR.negative) + ' | ' + deltaTxt(weekR.negative, priorR.negative) + ' |\n\n';
md += '## Campaign ranking (by positives → positive rate)\n\n';
if (rankedCamps.length === 0) md += '_No campaigns this week._\n\n';
else {
  md += '| # | Campaign | Status | Sent | Replies | Positives | OOO | Negative |\n';
  md += '|---|---|---|---|---|---|---|---|\n';
  let mdRank = 1;
  for (const c of rankedCamps) {
    if (c.sent === 0 && c.positive === 0 && c.replies === 0) continue;
    md += '| ' + mdRank + ' | ' + c.name + ' | ' + (c.status || '?') + ' | ' + fmtNum(c.sent) + ' | ' + fmtNum(c.replies) + ' (' + fmtPct(c.replyPct) + ') | **' + fmtNum(c.positive) + ' (' + fmtPct(c.posPct) + ')** | ' + fmtNum(c.ooo) + ' | ' + fmtNum(c.negative) + ' |\n';
    mdRank++;
  }
  md += '\n';
}
md += '## Notes\n\n';
md += '- Replies are deduped by `thread_id` (latest message label per conversation)\n';
md += '- Includes ACTIVE + COMPLETED campaigns only\n';
md += '- Counts include OOO (auto-replies are part of the reply total)\n';
md += '- For client-facing send, edit a copy and fill bookings + analysis paragraph\n\n';
md += '---\n_Generated by Flowroots n8n — Weekly KPI Report. ' + today + '._\n';

const mdFilename = today + ' - Weekly report.md';

return [
  { json: { kind: 'client', workspace_name: workspaceName, workspace_id: workspaceId, blocks: JSON.stringify({ blocks: clientBlocks }), fallback: clientFallback, markdown: md, filename: mdFilename } },
  { json: { kind: 'internal', workspace_name: workspaceName, workspace_id: workspaceId, blocks: JSON.stringify({ blocks: internalBlocks }), fallback: internalFallback, markdown: md, filename: mdFilename } }
];