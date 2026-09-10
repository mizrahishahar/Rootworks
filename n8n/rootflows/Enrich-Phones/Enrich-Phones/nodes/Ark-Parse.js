// AI-Ark v2 envelope: HTTP 200 always; body.status 200 = hit (numbers nested in
// data.data as arrays of strings), body.status 404 = clean miss, anything else = failure.
const prev = $('Ark Prep').first().json;
const j = Object.assign({}, prev); delete j.callBody;
const acc = j.acc;
const resp = $input.first().json;
let b = resp && resp.body !== undefined ? resp.body : resp;
if (typeof b === 'string') { try { b = JSON.parse(b); } catch (e) { b = null; } }
const code = resp && resp.statusCode;
const isTollFree = (p) => { let x = String(p || '').replace(/\D/g, ''); if (x.length === 11 && x.charAt(0) === '1') x = x.slice(1); return x.length === 10 && /^(?:800|833|844|855|866|877|888)/.test(x); };
const plausible = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 7 && d.length <= 15; };
if (!b || typeof b !== 'object') { acc.failed.push('ai-ark: unparseable response (HTTP ' + (code || '?') + ')'); return [{ json: j }]; }
const st = Number(b.status || code || 0);
if (st === 404) return [{ json: j }]; // clean miss
if (st !== 200) {
  const msg = (b.error && (b.error.error || b.error.message)) || ('HTTP ' + st);
  if (/credit|quota|payment|insufficient/i.test(String(msg)) || st === 402) acc.skipped.push('ai-ark: out of credits');
  else acc.failed.push('ai-ark: ' + String(msg).slice(0, 120));
  return [{ json: j }];
}
const nums = [];
const flat = (x) => { if (!x) return; if (Array.isArray(x)) { x.forEach(flat); return; } if (typeof x === 'string' && plausible(x)) nums.push(x.trim()); };
flat(b.data && b.data.data);
let hit = '', tf = '';
for (const n of nums) { if (isTollFree(n)) { if (!tf) tf = n; } else { hit = n; break; } }
if (hit) { acc.phone = hit; acc.source = 'ai-ark'; }
else if (tf && !acc.tf) { acc.tf = tf; acc.tf_source = 'ai-ark-tollfree'; }
return [{ json: j }];
