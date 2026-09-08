// Collect RB: one page of the campaign's leads. Every profile URL on the page is a confirmed
// member, keyed the way Build Rows keyed the source rows (lower-case, no scheme, no www, no
// trailing slash, no query). The item shape is taken loosely: a profileUrl at the top of the
// item or under its lead object, whichever HeyReach sends. Pages stop at totalCount, at an
// empty page, or at a cap of 80 pages (8,000 leads), which is warned, never silent.
// A non-2xx answer is retried with backoff (Retry-After honoured) up to five times, then the
// read-back is marked failed and the unconfirmed rows stay unstamped, exactly as on PlusVibe.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk]; const R = D.rb;
const j = ($input.first() || {}).json || {};
const hasWrap = Object.prototype.hasOwnProperty.call(j, 'body');
const body = hasWrap ? j.body : j;
const status = Number(j.statusCode || 0);
const emit = o => [{ json: o }];
const normUrl = u => String(u || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '').split('?')[0];
const page = (offset) => emit({ body: { campaignId: Number(D.target), offset: offset, limit: 100 }, wait: 1 });
if ((status && (status < 200 || status >= 300)) || !body || typeof body !== 'object' || (j.error && !hasWrap && !status)) {
  R.attempts++;
  if (R.attempts <= 5) {
    let w = Math.pow(2, R.attempts);
    const h = j.headers || {}; const ra = Number(h['retry-after'] || h['Retry-After'] || 0); if (ra > 0) w = Math.max(w, Math.min(ra, 120));
    return emit({ body: { campaignId: Number(D.target), offset: R.offset, limit: 100 }, wait: w });
  }
  D.rbFailed = true;
  D.errors.push('read-back failed at offset ' + R.offset + ' after 5 retries (status ' + (status || '?') + '): ' + JSON.stringify(body).slice(0, 200) + '; unconfirmed rows left unstamped');
  return emit({ done: true, wait: 0 });
}
R.attempts = 0;
const items = Array.isArray(body.items) ? body.items : (Array.isArray(body.leads) ? body.leads : (Array.isArray(body) ? body : []));
if (typeof body.totalCount === 'number') R.total = body.totalCount;
for (const it of items) {
  const l = (it && it.lead && typeof it.lead === 'object') ? it.lead : (it || {});
  const u = normUrl(l.profileUrl || l.linkedInProfileUrl || l.linkedinUrl || it.profileUrl || '');
  if (u) D.inCamp[u] = 1;
}
R.pages++;
R.offset += items.length;
D.campaignProspects = Math.max(D.campaignProspects || 0, R.total >= 0 ? R.total : R.offset);
const more = items.length > 0 && (R.total < 0 || R.offset < R.total);
if (more && R.pages >= 80) { D.warnings.push('read-back capped at 80 pages (' + R.offset + ' of ' + R.total + ' campaign leads read); rows beyond it may be stamped as not in campaign'); return emit({ done: true, wait: 0 }); }
if (more) return page(R.offset);
return emit({ done: true, wait: 0 });
