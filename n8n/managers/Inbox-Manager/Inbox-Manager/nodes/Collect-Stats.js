// Reduce the stats pages to what the reply flags need: per inbox, per day, [sent, replies from people]. A page
// that failed marks the read incomplete, and Decide then keeps Never landed and Gone quiet as the last full read
// left them rather than judge a domain on half its days.
const sd = $getWorkflowStaticData('global');
const prep = $('Prep Stat Calls').all().map(i => i.json);
const res = $input.all().map(i => (i && i.json) || {});
const out = { ok: true, pages: prep.filter(p => !p._none).length, failedPages: 0, start: (prep[0] && prep[0].start) || '', end: (prep[0] && prep[0].end) || '', byInbox: {} };
if (prep.length === 1 && prep[0]._none) { sd.cw.stats = out; return [{ json: { pages: 0 } }]; }
prep.forEach((p, i) => {
  const r = res[i] || {};
  const st = r.statusCode;
  const body = r.body;
  if (!(st >= 200 && st < 300) || !body || !Array.isArray(body.accounts)) { out.ok = false; out.failedPages++; return; }
  for (const acc of body.accounts) {
    const days = {};
    for (const c of (Array.isArray(acc.chart) ? acc.chart : [])) {
      const sent = Number(c.total_sent_count) || 0;
      const replies = Number(c.total_reply_count) || 0;
      if (sent || replies) days[String(c.date || '').slice(0, 10)] = [sent, replies];
    }
    out.byInbox[String(acc.email_acc_id)] = days;
  }
});
sd.cw.stats = out;
return [{ json: { pages: prep.length, failedPages: out.failedPages } }];
