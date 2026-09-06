// Collect Attach: the response of attach-leads for the chunk Collect Create just created. A 200
// with success:true means the campaign accepted the ids (on an active campaign Bison caches them
// and syncs within five minutes; the read-back waits for that). Attach is the step that advances
// the queue: the next item is the next chunk's create body, or done.
// Live progress is written to the launch row after every chunk (Stamp Progress hangs off this
// output as a SIDE branch; it must never sit between this node and Send Done?).
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk]; const S = D.send;
const j = ($input.first() || {}).json || {};
const hasWrap = Object.prototype.hasOwnProperty.call(j, 'body');
const rb = hasWrap ? j.body : j;
const status = Number(j.statusCode || 0);
const P = D.pv || (D.pv = { sent: 0, uploaded: 0, duplicate: 0, already: 0, invalid: 0, skipped: 0, overwritten: 0, overflowed: 0, remaining: null });
const ids = D.pendingIds || [];
const fmt = v => Number(v || 0).toLocaleString('en-US');
const mkCreate = (chunk) => Object.assign({ leads: chunk }, D.flags || {});
const emit = (o) => {
  const total = S.queue.length || 1; const doneChunks = Math.min(S.idx, total);
  const lines = ['**Uploading to ' + (D.campName || '?') + '**', '', '- Chunk ' + fmt(doneChunks) + ' of ' + fmt(total), '- Sent so far: ' + fmt(P.sent), '- Accepted so far: ' + fmt(P.uploaded)];
  if (P.invalid) lines.push('- Skipped by Email Bison at create (personal domain or invalid): ' + fmt(P.invalid));
  lines.push('', 'Read-back and the full report follow once uploading finishes.');
  return [{ json: Object.assign({ _lid: D.launchId || '', _prog: lines.join('\n'), target: D.target || '' }, o) }];
};
const advance = () => {
  D.pendingIds = [];
  if (S.idx < S.queue.length) S.queue[S.idx] = null;
  S.idx++; S.attempts = 0;
  if (S.idx < S.queue.length && S.queue[S.idx]) return emit({ kind: 'create', body: mkCreate(S.queue[S.idx]), wait: 2 });
  return emit({ done: true, wait: 0 });
};
const retryOrGiveUp = (why) => {
  S.attempts++;
  if (S.attempts <= 3 && ids.length) {
    let w = Math.pow(2, S.attempts);
    const h = j.headers || {}; const ra = Number(h['retry-after'] || h['Retry-After'] || 0); if (ra > 0) w = Math.max(w, Math.min(ra, 120));
    return emit({ kind: 'attach', body: { lead_ids: ids, allow_parallel_sending: false }, wait: w });
  }
  D.errors.push('attach-leads for chunk ' + (S.idx + 1) + '/' + S.queue.length + ' failed after 3 retries: ' + why);
  // The leads exist on Bison but never reached the campaign; the read-back will find them missing
  // and the stamp says so per row. Nothing is counted as accepted.
  return advance();
};
if (j.error && !hasWrap && !status) return retryOrGiveUp('node error: ' + String(j.error).slice(0, 200));
const ok = status >= 200 && status < 300 && rb && rb.data && rb.data.success !== false;
if (ok) { P.uploaded += ids.length; D.uploadedNew += ids.length; return advance(); }
return retryOrGiveUp('HTTP ' + (status || '?') + ' ' + JSON.stringify(rb).slice(0, 200));
