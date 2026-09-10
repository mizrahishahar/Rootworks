// The single response item, for both doors. Every count here comes from the read-back, never
// from the write responses: the API returns success while dropping accounts.
const ctx = $('Resolve Workspace').first().json;
const fail = (error) => [{ json: { ok: false, client: ctx.client, tag: ctx.tag, error, members: [], campaigns: [] } }];
if (!ctx.ok) return fail(ctx.error);

let plan = null;
try { plan = $('Plan Campaigns').first().json._plan; } catch (e) {}
if (!plan) return fail('the plan was never built');
if (!plan.tagFound) return fail('no tag named "' + ctx.tag + '" in this workspace');

let prep = [];
try { prep = $('Prep Read Back').all().map(i => i.json); } catch (e) {}
let back = [];
try { back = $('Read Back Accounts').all().map(i => i && i.json); } catch (e) {}
let before = [];
try { before = $('Build Ops').first().json._campaigns || []; } catch (e) {}
const applied = prep.length ? (prep[0]._applied || []) : [];

const campaigns = plan.campaigns.map((c) => {
  const i = prep.findIndex(p => p.campaign_id === c.id);
  const r = i > -1 ? (back[i] || {}) : {};
  const raw = r.body === undefined ? r : r.body;
  const finalList = Array.isArray(raw) ? [...new Set(raw.map(e => String(e || '').toLowerCase()))] : null;
  const mine = applied.filter(a => a.campaign_id === c.id);
  const b = before.find(x => x.id === c.id) || {};
  return {
    id: c.id,
    name: c.name,
    status: c.status,
    added: mine.filter(a => a.op === 'add' && a.ok).map(a => a.email),
    removed: mine.filter(a => a.op === 'remove' && a.ok).map(a => a.email),
    failed: mine.filter(a => !a.ok).map(a => ({ op: a.op, email: a.email, error: a.error })),
    final_count: finalList ? finalList.length : null,
    // True only when the read-back is exactly the tag's membership: the only real proof.
    matches_tag: finalList ? (plan.members.every(m => finalList.includes(m)) && finalList.every(e => plan.taggedAll.includes(e))) : null,
    read_ok: b.read_ok === undefined ? null : b.read_ok,
  };
});

return [{
  json: {
    ok: true,
    client: ctx.client,
    tag: ctx.tag,
    selection: plan.mode,
    members: plan.members,
    skipped_error_status: plan.skipped,
    campaigns,
  },
}];
