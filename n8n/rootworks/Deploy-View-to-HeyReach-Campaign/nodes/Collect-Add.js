// Collect Add: the response of one AddLeadsToCampaignV2 chunk. HeyReach answers with counts only,
// {addedLeadsCount, updatedLeadsCount, failedLeadsCount}, never with names: added means new in the
// campaign, updated means the profile was already there and its fields were refreshed, failed means
// refused. Which rows failed is decided by the read-back, not here. Add is the one call of the
// loop and the step that advances the queue: the next item is the next chunk's body, or done.
// Counters ride in D.pv on purpose: the shared Build Run Log reads them for every chunked sender.
// Live progress is written to the launch row after every chunk (Stamp Progress hangs off this
// output as a SIDE branch; it must never sit between this node and Send Done?).
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk]; const S = D.send;
const j = ($input.first() || {}).json || {};
const hasWrap = Object.prototype.hasOwnProperty.call(j, 'body');
const rb = hasWrap ? j.body : j;
const status = Number(j.statusCode || 0);
D.pv = D.pv || { sent: 0, uploaded: 0, duplicate: 0, already: 0, invalid: 0, skipped: 0, overwritten: 0, overflowed: 0, remaining: null };
const P = D.pv;
const cur = S.queue[S.idx] || [];
const fmt = v => Number(v || 0).toLocaleString('en-US');
const mkBody = (chunk) => ({ campaignId: Number(D.target), leads: chunk });
const emit = (o) => {
  const total = S.queue.length || 1; const doneChunks = Math.min(S.idx, total);
  const lines = ['**Uploading to ' + (D.campName || '?') + '**', '', '- Chunk ' + fmt(doneChunks) + ' of ' + fmt(total), '- Sent so far: ' + fmt(P.sent), '- Accepted so far: ' + fmt(P.uploaded) + ' (new ' + fmt(P.uploaded - P.already) + ', already in the campaign and refreshed ' + fmt(P.already) + ')'];
  if (P.invalid) lines.push('- Refused by HeyReach: ' + fmt(P.invalid));
  lines.push('', 'Read-back and the full report follow once uploading finishes.');
  return [{ json: Object.assign({ _lid: D.launchId || '', _prog: lines.join('\n'), target: D.target || '' }, o) }];
};
const skipRows = (chunk, why) => { for (const w of chunk) { const u = String(((w && w.lead) || {}).profileUrl || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '').split('?')[0]; const rid = D.urlToRow[u]; if (rid && D.rows[rid] && !D.rows[rid].skip) D.rows[rid].skip = why; } };
const advance = () => {
  if (S.idx < S.queue.length) S.queue[S.idx] = null;
  S.idx++; S.attempts = 0;
  if (S.idx < S.queue.length && S.queue[S.idx]) return emit({ body: mkBody(S.queue[S.idx]), wait: 2 });
  return emit({ done: true, wait: 0 });
};
const retryOrGiveUp = (why) => {
  S.attempts++;
  if (S.attempts <= 3 && cur.length) {
    let w = Math.pow(2, S.attempts);
    const h = j.headers || {}; const ra = Number(h['retry-after'] || h['Retry-After'] || 0); if (ra > 0) w = Math.max(w, Math.min(ra, 120));
    return emit({ body: mkBody(cur), wait: w });
  }
  D.errors.push('AddLeadsToCampaignV2 chunk ' + (S.idx + 1) + '/' + S.queue.length + ' failed after 3 retries: ' + why);
  skipRows(cur, 'add call failed');
  return advance();
};
if (j.error && !hasWrap && !status) return retryOrGiveUp('node error: ' + String(j.error).slice(0, 200));
if (status >= 200 && status < 300 && rb && typeof rb === 'object') {
  S.attempts = 0;
  const added = Number(rb.addedLeadsCount || 0), updated = Number(rb.updatedLeadsCount || 0), failed = Number(rb.failedLeadsCount || 0);
  P.sent += cur.length;
  P.uploaded += added + updated;
  P.already += updated;
  P.invalid += failed;
  D.uploadedNew += added;
  if (added + updated + failed !== cur.length) D.warnings.push('chunk ' + (S.idx + 1) + ': HeyReach accounted for ' + (added + updated + failed) + ' of ' + cur.length + ' leads sent (added ' + added + ', updated ' + updated + ', failed ' + failed + ')');
  return advance();
}
// 4xx that is not a rate limit is the whole chunk refused: name it, skip its rows, move on.
if (status >= 400 && status < 500 && status !== 429) {
  D.errors.push('AddLeadsToCampaignV2 chunk ' + (S.idx + 1) + '/' + S.queue.length + ' refused, HTTP ' + status + ': ' + JSON.stringify(rb).slice(0, 300));
  skipRows(cur, 'refused by HeyReach (HTTP ' + status + ')');
  return advance();
}
return retryOrGiveUp('HTTP ' + (status || '?') + ' ' + JSON.stringify(rb).slice(0, 200));
