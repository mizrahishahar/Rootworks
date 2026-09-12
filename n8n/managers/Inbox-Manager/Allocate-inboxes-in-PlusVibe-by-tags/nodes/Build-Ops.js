// The diff, one operation per item. A campaign already carrying exactly the tag's members
// produces no operations at all, which is what makes this read-only when nothing differs.
const camps = $('Plan Campaigns').all().map(i => i.json);
const plan = camps[0]._plan;
let res = [];
try { res = $('Get Campaign Accounts').all().map(i => i && i.json); } catch (e) {}

const ops = [];
const perCampaign = [];
camps.forEach((c, i) => {
  const r = res[i] || {};
  const st = r.statusCode;
  const ok = st === undefined ? false : (st >= 200 && st < 300);
  const raw = r.body === undefined ? r : r.body;
  const cur = Array.isArray(raw) ? [...new Set(raw.map(e => String(e || '').toLowerCase()))] : [];
  const missing = ok ? plan.members.filter(m => !cur.includes(m)) : [];
  const extra = ok ? cur.filter(e => !plan.taggedAll.includes(e)) : [];
  perCampaign.push({ id: c.campaign_id, name: c.name, status: c.status, read_ok: ok, before_count: cur.length, missing, extra });
  for (const email of missing) ops.push({ campaign_id: c.campaign_id, name: c.name, op: 'add', email, url: 'https://api.plusvibe.ai/api/v1/campaign/add/account', body: { workspace_id: plan.workspaceId, campaign_id: c.campaign_id, email } });
  for (const email of extra) ops.push({ campaign_id: c.campaign_id, name: c.name, op: 'remove', email, url: 'https://api.plusvibe.ai/api/v1/campaign/remove/account', body: { workspace_id: plan.workspaceId, campaign_id: c.campaign_id, email } });
});

const carry = { _plan: plan, _campaigns: perCampaign };
if (!ops.length) return [{ json: Object.assign({ _noop: true }, carry) }];
return ops.map(o => ({ json: Object.assign({}, o, carry) }));
