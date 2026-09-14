// Collect Run Stats: one answer per (campaign, week), in the order the calls went out. The
// answer is the campaign's totals over that range; new_lead_contacted_count is the people first
// contacted in the range, positive_reply_count the positives in it. A failed call leaves that
// week out and adds an error to the run; the report never hides a missing week behind a zero.
const sd = $getWorkflowStaticData('global');
const calls = sd.runStatCalls || [];
let res = [];
try { res = $('Run Stats').all().map(i => i.json || {}); } catch (e) {}
const byRid = {};
for (const R of sd.results || []) for (const c of R.run) byRid[c.rid] = { c, R };
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
calls.forEach((call, i) => {
  const hit = byRid[call.rid]; if (!hit) return;
  const j = res[i] || {};
  const body = Object.prototype.hasOwnProperty.call(j, 'body') ? j.body : j;
  const status = Number(j.statusCode || 0);
  // The body is the campaign objects indexed numerically, as an array or as an object of keys.
  let list = [];
  if (Array.isArray(body)) list = body;
  else if (body && typeof body === 'object') list = Object.keys(body).filter(k => /^\d+$/.test(k)).map(k => body[k]).concat(Array.isArray(body.data) ? body.data : []);
  const stat = list.find(x => x && String(x._id || x.id || '') === hit.c.campaignId) || (list.length === 1 ? list[0] : null);
  if ((status && (status < 200 || status >= 300)) || !stat) { sd.failed.push(hit.R.client + ': no ' + call.label + ' series for "' + hit.c.name + '" (status ' + (status || '?') + ')'); return; }
  hit.c.weeks = hit.c.weeks || [];
  hit.c.weeks.push({ label: call.label, contacted: num(stat.new_lead_contacted_count), positives: num(stat.positive_reply_count) });
});
return [{ json: { series: calls.length } }];
