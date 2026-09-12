// Collect Create: the response of one create-or-update chunk. Bison returns every lead it now
// holds for the chunk, with ids; a lead it dropped (a personal domain, an address it judged
// invalid) is simply absent, so the emails that came back are compared with the emails sent and
// the rest are skipped by name. The ids go to Attach as the next call of the loop; nothing here
// advances the queue, Collect Attach does that once the chunk is really in the campaign.
// Counters ride in D.pv on purpose: the shared Build Run Log reads them for every email sender.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk]; const S = D.send;
const j = ($input.first() || {}).json || {};
const hasWrap = Object.prototype.hasOwnProperty.call(j, 'body');
const rb = hasWrap ? j.body : j;
const status = Number(j.statusCode || 0);
D.pv = D.pv || { sent: 0, uploaded: 0, duplicate: 0, already: 0, invalid: 0, skipped: 0, overwritten: 0, overflowed: 0, remaining: null };
D.bisonIds = D.bisonIds || [];
const P = D.pv;
const cur = S.queue[S.idx] || [];
const mkCreate = (chunk) => Object.assign({ leads: chunk }, D.flags || {});
const out = (o) => [{ json: Object.assign({ target: D.target || '' }, o) }];
const advance = () => {
  if (S.idx < S.queue.length) S.queue[S.idx] = null;
  S.idx++; S.attempts = 0;
  if (S.idx < S.queue.length && S.queue[S.idx]) return out({ kind: 'create', body: mkCreate(S.queue[S.idx]), wait: 2 });
  return out({ done: true, wait: 0 });
};
const skipRow = (email, why) => { const rid = D.emailToRow[String(email || '').toLowerCase()]; if (rid && D.rows[rid] && !D.rows[rid].skip) D.rows[rid].skip = why; };
if (j.error && !hasWrap && !status) {
  // The HTTP node itself errored (no request went out). Retry the same chunk, capped.
  S.attempts++;
  if (S.attempts <= 3 && cur.length) return out({ kind: 'create', body: mkCreate(cur), wait: Math.pow(2, S.attempts) });
  D.errors.push('create chunk ' + (S.idx + 1) + '/' + S.queue.length + ' node error: ' + String(j.error).slice(0, 200));
  for (const l of cur) skipRow(l.email, 'create call failed');
  return advance();
}
const arr = rb && Array.isArray(rb.data) ? rb.data : null;
if (status >= 200 && status < 300 && arr) {
  S.attempts = 0;
  P.sent += cur.length;
  const back = {};
  for (const l of arr) { const e = String(l.email || '').toLowerCase().trim(); if (e && l.id) back[e] = l.id; }
  const ids = [];
  for (const l of cur) {
    const e = String(l.email || '').toLowerCase().trim();
    if (back[e]) { ids.push(back[e]); D.bisonIds.push({ id: back[e], email: e }); }
    else { P.invalid++; skipRow(e, 'skipped by Email Bison at create (personal domain or invalid address)'); }
  }
  D.pendingIds = ids;
  if (!ids.length) return advance();
  return out({ kind: 'attach', body: { lead_ids: ids, allow_parallel_sending: false }, wait: 2 });
}
// Laravel-style validation: 422 with errors keyed "leads.<index>.<field>". Drop those rows, resend the rest.
if (status === 422 && rb && rb.errors && typeof rb.errors === 'object') {
  const bad = {};
  for (const k of Object.keys(rb.errors)) { const m = /^leads\.(\d+)\./.exec(k); if (m) bad[Number(m[1])] = String((rb.errors[k] || [])[0] || k).slice(0, 120); }
  const idxs = Object.keys(bad);
  if (idxs.length) {
    const keep = [];
    cur.forEach((l, i) => {
      if (bad[i] !== undefined) { D.errors.push('lead rejected by Email Bison validation, dropped: ' + (l.email || ('index ' + i)) + ' (' + bad[i] + ')'); skipRow(l.email, 'rejected by Email Bison validation'); }
      else keep.push(l);
    });
    if (keep.length) { S.queue[S.idx] = keep; return out({ kind: 'create', body: mkCreate(keep), wait: 2 }); }
    return advance();
  }
}
const bs = JSON.stringify(rb || {}).toLowerCase();
if ((status === 413 || status === 400) && cur.length > 25 && /too large|payload|entity|body size|request size/.test(bs)) {
  const half = Math.ceil(cur.length / 2);
  const a = cur.slice(0, half), b = cur.slice(half);
  S.queue.splice(S.idx, 1, a, b);
  return out({ kind: 'create', body: mkCreate(a), wait: 2 });
}
S.attempts++;
if (S.attempts <= 3 && cur.length) {
  let w = Math.pow(2, S.attempts);
  const h = j.headers || {}; const ra = Number(h['retry-after'] || h['Retry-After'] || 0); if (ra > 0) w = Math.max(w, Math.min(ra, 120));
  return out({ kind: 'create', body: mkCreate(cur), wait: w });
}
D.errors.push('create chunk ' + (S.idx + 1) + '/' + S.queue.length + ' failed after 3 retries (status ' + (status || '?') + '): ' + JSON.stringify(rb).slice(0, 200));
for (const l of cur) skipRow(l.email, 'create call failed');
return advance();
