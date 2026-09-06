// One email-stats call per (inbox, window). Eleven windows per inbox: forward from the day the
// inbox was created at 7/14/30/60/90 days, backward from today at the same, plus all-time.
// Windows that collapse onto the same span (a young inbox's 60- and 90-day forward window is
// all-time) are called once; the full window map rides on the first item so nothing has to
// recompute it downstream.
const cw = $('Loop Over Clients').first().json;
const pages = $('List Email Accounts').all().map(i => i && i.json).filter(j => j && typeof j === 'object');
const accounts = [];
for (const p of pages) { if (Array.isArray(p.accounts)) accounts.push(...p.accounts); }

const today = $now.setZone('Asia/Jerusalem').startOf('day');
const todayS = today.toFormat('yyyy-MM-dd');
const NS = [7, 14, 30, 60, 90];
const windows = {};
const calls = [];
const seen = new Set();

for (const a of accounts) {
  const iso = String(a.timestamp_created || '');
  let created = iso ? DateTime.fromISO(iso).setZone('Asia/Jerusalem').startOf('day') : today;
  if (!created.isValid || created > today) created = today;
  const createdS = created.toFormat('yyyy-MM-dd');
  const ws = [];
  for (const n of NS) {
    const e = created.plus({ days: n });
    ws.push({ key: 'f' + n, start: createdS, end: (e > today ? today : e).toFormat('yyyy-MM-dd') });
  }
  for (const n of NS) {
    const s = today.minus({ days: n });
    ws.push({ key: 'b' + n, start: (s < created ? created : s).toFormat('yyyy-MM-dd'), end: todayS });
  }
  ws.push({ key: 'all', start: createdS, end: todayS });
  windows[a.id] = ws.map(w => ({ key: w.key, span: w.start + '|' + w.end }));
  for (const w of ws) {
    const span = w.start + '|' + w.end;
    const id = a.id + '|' + span;
    if (seen.has(id)) continue;
    seen.add(id);
    calls.push({
      accountId: a.id,
      span,
      url: 'https://api.plusvibe.ai/api/v1/account/email-stats?workspace_id=' + cw.pvWorkspace +
        '&email_acc_id=' + a.id + '&start_date=' + w.start + '&end_date=' + w.end,
    });
  }
}

if (!calls.length) return [{ json: { _none: true, _windows: windows } }];
return calls.map((c, i) => ({ json: i === 0 ? Object.assign({ _windows: windows }, c) : c }));
