// Prep Person: the second read of a dossier. get_prospect answers ids only, so the person behind
// the prospect is fetched by its personId. No personId means no second call and the door answers
// what the prospect read gave.
const parse = (raw) => { try { let s = raw; if (typeof s === 'object' && s.data) s = s.data; if (typeof s !== 'string') s = JSON.stringify(s); const m = s.match(/data:\s*(\{[\s\S]*\})/); const rpc = JSON.parse(m ? m[1] : s); const txt = rpc.result && rpc.result.content && rpc.result.content[0] && rpc.result.content[0].text; return txt ? (txt.startsWith('{') ? JSON.parse(txt) : txt) : null; } catch (e) { return null; } };
const p = parse($input.first().json) || {};
const personId = p.personId || '';
if (!personId) return [];
return [{ json: { callBody: { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_person', arguments: { personId } } } } }];
