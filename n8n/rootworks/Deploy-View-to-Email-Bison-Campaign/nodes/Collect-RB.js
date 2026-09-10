// Collect RB: one lead read back. Membership = lead_campaign_data contains this campaign's id.
// A non-2xx answer is retried with backoff (Retry-After honoured) up to five times, then the
// read-back is marked failed and the unconfirmed rows stay unstamped, exactly as on PlusVibe.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk]; const R = D.rb;
const ids = D.bisonIds || [];
const j = ($input.first() || {}).json || {};
const hasWrap = Object.prototype.hasOwnProperty.call(j, 'body');
const body = hasWrap ? j.body : j;
const status = Number(j.statusCode || 0);
const emit = o => [{ json: o }];
const next = () => {
  R.idx++; R.attempts = 0;
  if (R.idx < ids.length) return emit({ lead_id: ids[R.idx].id, wait: 1 });
  return emit({ done: true, wait: 0 });
};
const lead = body && body.data && typeof body.data === 'object' ? body.data : null;
if ((status && (status < 200 || status >= 300)) || !lead || (j.error && !hasWrap && !status)) {
  R.attempts++;
  if (R.attempts <= 5) {
    let w = Math.pow(2, R.attempts);
    const h = j.headers || {}; const ra = Number(h['retry-after'] || h['Retry-After'] || 0); if (ra > 0) w = Math.max(w, Math.min(ra, 120));
    return emit({ lead_id: ids[R.idx].id, wait: w });
  }
  D.rbFailed = true;
  D.errors.push('read-back failed at lead ' + (R.idx + 1) + '/' + ids.length + ' (id ' + ids[R.idx].id + ') after 5 retries (status ' + (status || '?') + '); unconfirmed rows left unstamped');
  return emit({ done: true, wait: 0 });
}
const want = String(D.target);
const camps = Array.isArray(lead.lead_campaign_data) ? lead.lead_campaign_data : [];
const member = camps.some(c => c && String(c.campaign_id) === want);
const e = String(lead.email || ids[R.idx].email || '').toLowerCase().trim();
if (member && e) D.inCamp[e] = 1;
return next();
