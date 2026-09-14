// Monday and launched runs only: the sender's per-inbox stats with a daily breakdown, for the 90 days ending
// yesterday (today is still arriving), 100 inboxes per page: a handful of calls per workspace. Replies are the
// sender's reply count, which never includes out-of-office replies.
const cw = $('Loop Over Clients').first().json;
const pages = $('List Email Accounts').all().map(i => i && i.json).filter(Boolean);
let count = 0;
for (const p of pages) { if (Array.isArray(p.accounts)) count += p.accounts.length; }
if (!count) return [{ json: { _none: true } }];
const end = $now.setZone('Asia/Jerusalem').minus({ days: 1 }).startOf('day');
const start = end.minus({ days: 89 });
const s = start.toFormat('yyyy-MM-dd'); const e = end.toFormat('yyyy-MM-dd');
const n = Math.ceil(count / 100);
return Array.from({ length: n }, (_, i) => ({
  json: {
    page: i + 1, start: s, end: e,
    url: 'https://api.plusvibe.ai/api/v1/account/email-stats/bulk?workspace_id=' + cw.pvWorkspace +
      '&start_date=' + s + '&end_date=' + e + '&page=' + (i + 1) + '&limit=100&include_chart=true',
  },
}));
