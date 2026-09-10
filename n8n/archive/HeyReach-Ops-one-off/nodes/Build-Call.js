// Build Call: one HeyReach public-API call on behalf of a client, the key read off the client's
// registry row (Clients.HeyReach API Key), never carried by the caller. The door exists so the
// API can be exercised and verified from HQ without the key ever leaving the Hub or n8n.
// Body: { client: rec..., method: GET|POST|DELETE, path: 'campaign/GetAll', query: {...}, body: {...} }.
// The path is relative to https://api.heyreach.io/api/public and must be a plain segment path.
// A caller mistake (no key on the row, a bad method or path) is answered as {refused}, never
// thrown: a wrong call is not a crash and does not belong on the Error Logger.
const w = $('Call Webhook').first().json || {};
const b = w.body || {};
const r = ($input.first() || {}).json || {};
const f = r.fields || r;
const key = String(f['HeyReach API Key'] || '').trim();
const method = String(b.method || 'GET').trim().toUpperCase();
const path = String(b.path || '').trim().replace(/^\/+/, '');
const client = String(f['Client'] || b.client || '?');
const refuse = (why) => [{ json: { ok: false, refused: why, client: client, method: method, path: path } }];
if (r.error || !r.id) return refuse('client row ' + String(b.client || '') + ' not found in the registry');
if (!key) return refuse('client "' + client + '" has no HeyReach API Key on its registry row; nothing was called');
if (method !== 'GET' && method !== 'POST' && method !== 'DELETE') return refuse('method must be GET, POST or DELETE, got "' + method + '"');
if (!/^[A-Za-z0-9_\-]+(\/[A-Za-z0-9_\-]+)*$/.test(path)) return refuse('path "' + path + '" is not a plain HeyReach endpoint path (e.g. campaign/GetAll)');
const q = (b.query && typeof b.query === 'object') ? b.query : {};
const qs = Object.keys(q).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(String(q[k]))).join('&');
return [{ json: {
  ok: true,
  hrKey: key,
  method: method,
  url: 'https://api.heyreach.io/api/public/' + path + (qs ? '?' + qs : ''),
  sendBody: method === 'POST',
  body: (b.body && typeof b.body === 'object') ? b.body : {},
  client: client,
  path: path
} }];
