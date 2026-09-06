// Pair each operation with its response, then hand one read-back call per campaign forward.
// Reached both from Apply Op and, when the diff was empty, straight from the Any Ops? gate.
const camps = $('Plan Campaigns').all().map(i => i.json);
const plan = camps[0]._plan;

let opsIn = [];
try { opsIn = $('Build Ops').all().map(i => i.json).filter(o => o && !o._noop); } catch (e) {}
let opsRes = [];
try { opsRes = $('Apply Op').all().map(i => i && i.json); } catch (e) {}

const applied = opsIn.map((o, i) => {
  const r = opsRes[i] || {};
  const st = r.statusCode;
  const ok = st !== undefined && st >= 200 && st < 300;
  const raw = r.body === undefined ? r : r.body;
  const msg = raw && (raw.message || raw.error) ? String(raw.message || raw.error) : ('HTTP ' + st);
  return { campaign_id: o.campaign_id, op: o.op, email: o.email, ok, error: ok ? '' : msg };
});

const base = 'https://api.plusvibe.ai/api/v1/campaign/get/accounts?workspace_id=' + plan.workspaceId + '&campaign_id=';
return camps.map(c => ({ json: { campaign_id: c.campaign_id, name: c.name, url: base + c.campaign_id, _plan: plan, _applied: applied } }));
