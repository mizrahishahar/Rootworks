// Prep Run Stats: the Run block shows the last weeks beside the all-time line, so a stall reads
// as a falling column. PlusVibe answers totals over a date range per campaign
// (GET analytics/campaign/stats), so one call per week per Run campaign, Monday to Sunday,
// the last five weeks including the current one. A Run campaign on a sender without date
// stats keeps its all-time line only. No campaign, one placeholder so the chain reaches the
// messages.
const sd = $getWorkflowStaticData('global');
const WEEKS = 5;
const iso = d => d.toISOString().slice(0, 10);
const monday = d => { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() - day + 1); return t; };
const isoWeek = d => { const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())); const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return 'w' + String(Math.ceil((((t - y0) / 86400000) + 1) / 7)).padStart(2, '0'); };
const now = new Date();
const weeks = [];
for (let i = WEEKS - 1; i >= 0; i--) {
  const start = monday(new Date(now.getTime() - i * 7 * 86400000));
  const end = new Date(Math.min(start.getTime() + 6 * 86400000, now.getTime()));
  weeks.push({ label: isoWeek(start), start: iso(start), end: iso(end) });
}
const calls = [];
for (const R of sd.results || []) {
  for (const c of R.run) {
    if (c.sender !== 'PlusVibe' || !R.pvWorkspace || !c.campaignId) continue;
    for (const w of weeks) calls.push({ rid: c.rid, label: w.label, url: 'https://api.plusvibe.ai/api/v1/analytics/campaign/stats?workspace_id=' + encodeURIComponent(R.pvWorkspace) + '&campaign_id=' + encodeURIComponent(c.campaignId) + '&start_date=' + w.start + '&end_date=' + w.end });
  }
}
sd.runStatCalls = calls;
if (!calls.length) return [{ json: { _none: true } }];
return calls.map(x => ({ json: x }));
