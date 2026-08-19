// Parses the Supersoniq enrich_phone unlock. Charged only when a phone is on file.
const prev = $('SQ Pick').first().json;
const j = Object.assign({}, prev); delete j.callBody;
const acc = j.acc;
const resp = $input.first().json;
const parseMcp = (r) => {
  let raw = r; if (raw && raw.body !== undefined) raw = raw.body;
  const code = r && r.statusCode;
  if (typeof raw === 'object' && raw !== null) raw = JSON.stringify(raw);
  const m = String(raw).match(/data:\s*(\{[\s\S]*\})/);
  let rpc; try { rpc = JSON.parse(m ? m[1] : String(raw)); } catch (e) { return { err: 'unparseable response (HTTP ' + (code || '?') + ')' }; }
  if (rpc.error) return { err: rpc.error.message || 'rpc error' };
  const res = rpc.result || {};
  const c = res.content && res.content[0];
  if (res.isError) return { err: (c && c.text) ? String(c.text).slice(0, 200) : 'tool error' };
  if (!c) return { err: 'empty result' };
  if (c.text !== undefined) { try { return { data: JSON.parse(c.text) }; } catch (e) { return { data: c.text }; } }
  return { data: c };
};
const isTollFree = (p) => { let x = String(p || '').replace(/\D/g, ''); if (x.length === 11 && x.charAt(0) === '1') x = x.slice(1); return x.length === 10 && /^(?:800|833|844|855|866|877|888)/.test(x); };
const plausible = (p) => { const d = String(p || '').replace(/\D/g, ''); return d.length >= 7 && d.length <= 15; };
const r = parseMcp(resp);
if (r.err) { acc.failed.push('supersoniq phone: ' + r.err); return [{ json: j }]; }
const d = r.data || {};
let phone = '';
const dig = (x, depth) => { if (phone || !x || depth > 3) return; if (typeof x === 'string') return; if (Array.isArray(x)) { x.forEach((v) => dig(v, depth + 1)); return; } if (typeof x === 'object') { for (const k of ['phone', 'phone_number', 'mobile', 'mobile_phone', 'mobile_number', 'number']) { if (typeof x[k] === 'string' && plausible(x[k])) { phone = x[k].trim(); return; } } for (const v of Object.values(x)) dig(v, depth + 1); } };
dig(d, 0);
if (phone) {
  if (isTollFree(phone)) { if (!acc.tf) { acc.tf = phone; acc.tf_source = 'supersoniq-tollfree'; } }
  else { acc.phone = phone; acc.source = 'supersoniq'; }
}
return [{ json: j }];
