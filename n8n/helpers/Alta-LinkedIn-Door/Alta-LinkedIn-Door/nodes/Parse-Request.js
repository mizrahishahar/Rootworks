// Parse Request: the contract, refused before anything is spent. Three actions, nothing else.
//   get_thread    {prospectId, campaignId?, repId?}
//   get_prospect  {prospectId}
//   send_reply    {prospectId, body, campaignId?, repId?}
// The door answers 200 with ok:false and a reason on a bad request; only the shapes below go further.
const b = ($input.first().json || {}).body || {};
const s = (v) => String(v == null ? '' : v).trim();
const action = s(b.action).toLowerCase();
const prospectId = s(b.prospectId);
const campaignId = s(b.campaignId);
const repId = s(b.repId);
const body = String(b.body == null ? '' : b.body);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const bad = (why) => [{ json: { _ok: false, _code: 400, ok: false, error: why, action: action || null, prospectId: prospectId || null } }];

if (['get_thread', 'get_prospect', 'send_reply'].indexOf(action) < 0) return bad('action must be one of get_thread, get_prospect, send_reply');
if (!prospectId) return bad('prospectId is required');
if (!UUID.test(prospectId)) return bad('prospectId must be an Alta prospect uuid');
if (campaignId && !UUID.test(campaignId)) return bad('campaignId must be an Alta campaign uuid');
if (repId && !UUID.test(repId)) return bad('repId must be an Alta rep uuid');
if (action === 'send_reply') {
  // 2,000 characters is Alta's own ceiling; a longer body is refused, never silently cut.
  if (!body.trim()) return bad('body is required for send_reply');
  if (body.length > 2000) return bad('body is ' + body.length + ' characters; Alta takes 2000');
}
return [{ json: { _ok: true, action, prospectId, campaignId, repId, body, startedAt: new Date().toISOString() } }];
