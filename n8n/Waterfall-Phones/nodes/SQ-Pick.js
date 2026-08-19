// Parses the Supersoniq resolution response, matches the contact by name,
// and builds the enrich_phone unlock call. A person Supersoniq doesn't know is a
// clean miss; a refused/unparseable call is a failure (retryable), never a negative.
const prev = $('SQ Prep').first().json;
const j = Object.assign({}, prev); delete j.callBody;
const acc = j.acc, p = j.person;
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
const out = (call, body) => [{ json: Object.assign({}, j, { _call: call ? 1 : 0 }, body ? { callBody: body } : {}) }];
const r = parseMcp(resp);
if (r.err) { acc.failed.push('supersoniq resolve: ' + r.err); return out(0); }
const contacts = [];
const walk = (x) => { if (!x) return; if (Array.isArray(x)) { x.forEach(walk); return; } if (typeof x === 'object') { if (Array.isArray(x.contacts)) contacts.push(...x.contacts); for (const v of Object.values(x)) { if (v && typeof v === 'object') walk(v); } } };
walk(r.data);
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '');
const wantF = norm(p.first_name), wantL = norm(p.last_name);
const wantFull = norm(p.full_name) || (wantF + wantL);
let match = null;
for (const ct of contacts) {
  const f = norm(ct.first_name), l = norm(ct.last_name);
  const full = norm(ct.full_name) || (f + l);
  if (wantF && wantL && f === wantF && l === wantL) { match = ct; break; }
  if (wantFull && full && full === wantFull) { match = ct; break; }
}
if (!match && contacts.length === 1 && wantF && norm(contacts[0].first_name) === wantF) match = contacts[0];
const cid = match && (match.contact_id || match.id || match.uuid);
if (!cid) return out(0); // not in Supersoniq, or no id in the payload: a miss, next tier
const callBody = { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'enrich_phone', arguments: { contact_id: String(cid) } } };
return out(1, callBody);
