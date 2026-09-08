// Compact: the raw HeyReach answer back to the caller, status and body, the key never echoed.
// A refused call arrives here straight from Build Call and is passed through as is.
// The body is capped so a big list does not flood the webhook response; the caller pages.
const c = $('Build Call').first().json || {};
if (c.ok === false) return [{ json: c }];
const j = ($input.first() || {}).json || {};
const hasWrap = Object.prototype.hasOwnProperty.call(j, 'body');
const body = hasWrap ? j.body : j;
const status = Number(j.statusCode || 0);
let text = '';
try { text = typeof body === 'string' ? body : JSON.stringify(body); } catch (e) { text = String(body); }
const capped = text.length > 60000;
return [{ json: {
  ok: status >= 200 && status < 300,
  client: c.client || '',
  method: c.method || '',
  path: c.path || '',
  status: status,
  error: (j.error && !hasWrap && !status) ? String(j.error).slice(0, 500) : '',
  capped: capped,
  body: capped ? text.slice(0, 60000) : body
} }];
