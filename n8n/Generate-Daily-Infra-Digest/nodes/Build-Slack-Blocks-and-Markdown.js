const ext = $('Pick One Email Per Domain').first().json;
const accounts = ext.accounts || [];
const workspaceName = ext.workspace_name;
const workspaceId = ext.workspace_id;
const vitals = $input.first().json || {};
const successList = Array.isArray(vitals.success_list) ? vitals.success_list : [];
const failureList = Array.isArray(vitals.failure_list) ? vitals.failure_list : [];
const campStats = $('Stats Campaigns Lifetime').all().map(function(i){ return i.json; });

const REPLY_GATE_SENDS = 1000;

const vitalsByDomain = {};
for (const v of successList) { if (v && v.domain) vitalsByDomain[String(v.domain).toLowerCase()] = v; }
const failedDomains = {};
for (const d of failureList) { const dn = (d && d.domain) ? d.domain : d; failedDomains[String(dn).toLowerCase()] = true; }

function domainOf(email) { const at = String(email || '').indexOf('@'); return at > -1 ? String(email).slice(at+1).toLowerCase() : ''; }

const campaignSentLifetime = {};
for (const c of campStats) { if (c && c._id) campaignSentLifetime[c._id] = c.sent_count || 0; }

const inboxesPerCampaign = {};
for (const a of accounts) {
  const cmps = (a.payload && a.payload.cmps) || [];
  for (const c of cmps) {
    const cid = c.id;
    if (!cid) continue;
    inboxesPerCampaign[cid] = (inboxesPerCampaign[cid] || 0) + 1;
  }
}

const inboxSentLifetime = {};
for (const a of accounts) {
  let total = 0;
  const cmps = (a.payload && a.payload.cmps) || [];
  for (const c of cmps) {
    const cid = c.id;
    if (!cid) continue;
    const campSent = campaignSentLifetime[cid] || 0;
    const campInboxes = inboxesPerCampaign[cid] || 1;
    total += campSent / campInboxes;
  }
  inboxSentLifetime[a.id] = total;
}

const domainMap = {};
for (const a of accounts) {
  const dom = domainOf(a.email);
  if (!dom) continue;
  if (!domainMap[dom]) domainMap[dom] = { domain: dom, inboxes: 0, bounceVals: [], replyVals: [], inactive: 0, sentLifetime: 0 };
  const dm = domainMap[dom];
  dm.inboxes++;
  if (a.status !== 'ACTIVE') dm.inactive++;
  dm.sentLifetime += (inboxSentLifetime[a.id] || 0);
  const h = (a.payload && a.payload.analytics && a.payload.analytics.health_scores) || {};
  const r = (a.payload && a.payload.analytics && a.payload.analytics.reply_rates) || {};
  const bounce = h['3d_bounce_rate'];
  const reply = r['7d_replyrate'];
  if (typeof bounce === 'number' && bounce >= 0) dm.bounceVals.push(bounce);
  if (typeof reply === 'number' && reply >= 0) dm.replyVals.push(reply);
}

function avg(arr) { if (!arr.length) return null; let s = 0; for (const v of arr) s += v; return s / arr.length; }
function fmtPct(p, dec) { if (p === null || p === undefined || isNaN(p)) return 'n/a'; return p.toFixed(dec === undefined ? 2 : dec) + '%'; }
function fmtNum(n) { return Number(Math.round(n) || 0).toLocaleString('en-US'); }

function authStatus(dom) {
  if (failedDomains[dom]) return { sev: 'error', label: 'vitals lookup failed' };
  const v = vitalsByDomain[dom];
  if (!v) return { sev: 'noise', label: 'no data' };
  const issues = [];
  if (v.spf === false) issues.push('SPF');
  if (v.dkim === false) issues.push('DKIM');
  if (v.dmarc === false) issues.push('DMARC');
  if (v.mx === false) issues.push('MX');
  if (issues.length === 0) return { sev: 'ok', label: 'all pass' };
  return { sev: 'error', label: 'fail: ' + issues.join(', ') };
}
function bounceStatus(b) {
  if (b === null) return { sev: 'noise', label: 'no data' };
  if (b < 1) return { sev: 'ok', label: 'ok' };
  if (b <= 3) return { sev: 'warning', label: 'warning' };
  return { sev: 'error', label: 'error' };
}
function replyStatus(r, domSentLifetime) {
  if (domSentLifetime < REPLY_GATE_SENDS) return { sev: 'noise', label: 'needs 1k+ lifetime sent (est. ' + Math.round(domSentLifetime) + ')' };
  if (r === null) return { sev: 'noise', label: 'no data' };
  if (r < 1) return { sev: 'error', label: 'error (<1%)' };
  if (r < 2) return { sev: 'warning', label: 'warning (1-2%)' };
  return { sev: 'ok', label: 'ok (\u22652%)' };
}

const domains = Object.values(domainMap).map(function(d){
  const avgBounce = avg(d.bounceVals);
  const avgReply = avg(d.replyVals);
  const auth = authStatus(d.domain);
  const bounce = bounceStatus(avgBounce);
  const reply = replyStatus(avgReply, d.sentLifetime);
  let overall;
  if (auth.sev === 'error' || bounce.sev === 'error' || reply.sev === 'error') overall = 'error';
  else if (bounce.sev === 'warning' || reply.sev === 'warning') overall = 'warning';
  else if (auth.sev === 'ok' && (bounce.sev === 'ok' || bounce.sev === 'noise') && (reply.sev === 'ok' || reply.sev === 'noise')) {
    if (bounce.sev === 'noise' && reply.sev === 'noise') overall = 'noise';
    else overall = 'ok';
  } else overall = 'noise';
  return { domain: d.domain, inboxes: d.inboxes, inactive: d.inactive, avgBounce: avgBounce, avgReply: avgReply, sentLifetime: d.sentLifetime, auth: auth, bounce: bounce, reply: reply, overall: overall };
});

const order = { error: 0, warning: 1, ok: 2, noise: 3 };
domains.sort(function(a,b){ return (order[a.overall] || 99) - (order[b.overall] || 99); });
const counts = { ok: 0, warning: 0, error: 0, noise: 0 };
for (const d of domains) counts[d.overall]++;
const inactiveInboxes = domains.reduce(function(s,d){ return s + d.inactive; }, 0);
const totalSentLifetime = domains.reduce(function(s,d){ return s + d.sentLifetime; }, 0);

let headline;
if (counts.error > 0) headline = ':red_circle: ERROR';
else if (counts.warning > 0) headline = ':large_yellow_circle: WARNING';
else headline = ':large_green_circle: OK';

const today = new Date().toISOString().slice(0, 10);
const legend = ['*\ud83d\udcda Bands*','`Auth`   pass = ok  \u2022  any SPF/DKIM/DMARC/MX fail = error','`Bounce` <1% ok  \u2022  1-3% warning  \u2022  >3% error  (3-day avg per domain)','`Reply`  needs *1,000+ lifetime sent* per domain to judge  \u2022  <1% error  \u2022  1-2% warning  \u2022  \u22652% ok  (7-day avg rate)'].join('\n');

const blocks = [
  { type: 'header', text: { type: 'plain_text', text: 'Infra Health \u2014 ' + today, emoji: true } },
  { type: 'section', text: { type: 'mrkdwn', text: '*' + workspaceName + '*  \u2022  ' + domains.length + ' domains  \u2022  ' + accounts.length + ' inboxes' + (inactiveInboxes > 0 ? ' (' + inactiveInboxes + ' not ACTIVE)' : '') + '  \u2022  ~' + fmtNum(totalSentLifetime) + ' sent lifetime' } },
  { type: 'section', text: { type: 'mrkdwn', text: '*Status:* ' + headline + '   \u2022  :large_green_circle: ' + counts.ok + ' ok  \u2022  :large_yellow_circle: ' + counts.warning + ' warning  \u2022  :red_circle: ' + counts.error + ' error  \u2022  :hourglass: ' + counts.noise + ' no signal yet' } },
  { type: 'divider' },
  { type: 'section', text: { type: 'mrkdwn', text: legend } }
];

const attention = domains.filter(function(d){ return d.overall === 'error' || d.overall === 'warning'; });
if (attention.length === 0) {
  blocks.push({ type: 'divider' });
  blocks.push({ type: 'section', text: { type: 'mrkdwn', text: ':white_check_mark: *No domains need attention.* All ok or no signal yet.' } });
} else {
  blocks.push({ type: 'divider' });
  blocks.push({ type: 'section', text: { type: 'mrkdwn', text: '*\ud83d\udd0d Domains needing attention (' + attention.length + ')*' } });
  for (const d of attention) {
    const sevIcon = d.overall === 'error' ? ':red_circle:' : ':large_yellow_circle:';
    const head = sevIcon + ' *`' + d.domain + '`*  \u2014  ' + d.inboxes + ' inbox' + (d.inboxes === 1 ? '' : 'es') + (d.inactive > 0 ? '  \u2022  ' + d.inactive + ' not ACTIVE' : '');
    const lines = [head];
    if (d.auth.sev !== 'ok') lines.push('Auth:   ' + (d.auth.sev === 'error' ? ':x:' : ':warning:') + '  ' + d.auth.label);
    if (d.bounce.sev === 'warning' || d.bounce.sev === 'error') lines.push('Bounce: ' + (d.bounce.sev === 'error' ? ':x:' : ':warning:') + '  ' + fmtPct(d.avgBounce) + '  (' + d.bounce.label + ')');
    if (d.reply.sev === 'warning' || d.reply.sev === 'error') lines.push('Reply:  ' + (d.reply.sev === 'error' ? ':x:' : ':warning:') + '  ' + fmtPct(d.avgReply) + '  (' + d.reply.label + ')');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: lines.join('\n') } });
  }
}
blocks.push({ type: 'divider' });
blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: '_Reply rate gated on est. 1,000+ lifetime sent per domain. Sends per domain estimated by distributing each campaign\'s lifetime sends evenly across its assigned inboxes._' }]});

function sevEmoji(s) { return s === 'error' ? '\ud83d\udd34' : s === 'warning' ? '\ud83d\udfe1' : s === 'ok' ? '\ud83d\udfe2' : '\u23f3'; }
let md = '# Infra Health \u2014 ' + today + '\n\n';
md += '**Workspace:** ' + workspaceName + '  \n';
md += '**Domains:** ' + domains.length + '  \n';
md += '**Inboxes:** ' + accounts.length + (inactiveInboxes > 0 ? ' (' + inactiveInboxes + ' not ACTIVE)' : '') + '  \n';
md += '**Sends (est. lifetime):** ' + fmtNum(totalSentLifetime) + '  \n';
md += '**Status:** ' + headline.replace(/:[a-z_]+:/g,'').trim() + '\n\n';
md += '## Counts\n\n';
md += '- \ud83d\udfe2 OK: ' + counts.ok + '\n';
md += '- \ud83d\udfe1 Warning: ' + counts.warning + '\n';
md += '- \ud83d\udd34 Error: ' + counts.error + '\n';
md += '- \u23f3 No signal yet: ' + counts.noise + '\n\n';
md += '## Bands\n\n';
md += '- **Auth**: pass = ok, any SPF/DKIM/DMARC/MX fail = error\n';
md += '- **Bounce**: <1% ok, 1-3% warning, >3% error (3-day avg per domain)\n';
md += '- **Reply**: needs **1,000+ lifetime sent per domain** to judge. Then <1% error, 1-2% warning, \u22652% ok (7-day avg rate).\n\n';
if (attention.length === 0) md += '## All domains healthy or no signal yet\n\n';
else {
  md += '## Domains needing attention (' + attention.length + ')\n\n';
  md += '| Domain | Inboxes | Lifetime sent (est) | Auth | Bounce | Reply |\n';
  md += '|---|---|---|---|---|---|\n';
  for (const d of attention) {
    md += '| ' + sevEmoji(d.overall) + ' `' + d.domain + '` | ' + d.inboxes + (d.inactive > 0 ? ' (' + d.inactive + ' not ACTIVE)' : '') + ' | ' + fmtNum(d.sentLifetime) + ' | ' + d.auth.label + ' | ' + fmtPct(d.avgBounce) + ' (' + d.bounce.label + ') | ' + fmtPct(d.avgReply) + ' (' + d.reply.label + ') |\n';
  }
  md += '\n';
}
md += '## All domains (full)\n\n';
md += '| Domain | Inboxes | Lifetime sent (est) | Auth | Bounce | Reply | Overall |\n';
md += '|---|---|---|---|---|---|---|\n';
for (const d of domains) {
  md += '| `' + d.domain + '` | ' + d.inboxes + ' | ' + fmtNum(d.sentLifetime) + ' | ' + d.auth.label + ' | ' + fmtPct(d.avgBounce) + ' | ' + fmtPct(d.avgReply) + ' (' + d.reply.label + ') | ' + sevEmoji(d.overall) + ' ' + d.overall + ' |\n';
}
md += '\n---\n_Generated by Flowroots n8n \u2014 Daily Infra Digest. Reply rate gated on 1k+ lifetime sent per domain._\n';

const fallback = 'Infra (' + workspaceName + '): ' + counts.error + ' error, ' + counts.warning + ' warning, ' + counts.ok + ' ok, ' + counts.noise + ' no-signal';
return [{ json: { blocks: JSON.stringify({ blocks: blocks }), fallback: fallback, workspace_name: workspaceName, workspace_id: workspaceId, markdown: md } }];