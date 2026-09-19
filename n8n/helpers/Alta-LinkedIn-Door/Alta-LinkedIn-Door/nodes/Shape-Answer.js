// Shape Answer: the one JSON the Inbox reads, per action. Alta answers MCP over SSE, so every
// body is unwrapped the same way the campaign sync unwraps it.
// A tool error from Alta is an ok:false with Alta's own words, never a silent empty answer: a send
// that did not land must never read like one that did.
const parse = (raw) => { try { let s = raw; if (typeof s === 'object' && s.data) s = s.data; if (typeof s !== 'string') s = JSON.stringify(s); const m = s.match(/data:\s*(\{[\s\S]*\})/); const rpc = JSON.parse(m ? m[1] : s); if (rpc && rpc.error) return { _rpcError: rpc.error }; const c = rpc.result && rpc.result.content && rpc.result.content[0]; const txt = c && c.text; const isErr = !!(rpc.result && rpc.result.isError); if (!txt) return null; const val = txt.startsWith('{') || txt.startsWith('[') ? JSON.parse(txt) : txt; return isErr ? { _toolError: val } : val; } catch (e) { return null; } };
const r = $('Alta Token Gate').first().json || {};
const base = { ok: true, action: r.action, prospectId: r.prospectId };
const fail = (why, detail) => [{ json: Object.assign({}, base, { ok: false, _code: 502, error: why, detail: detail == null ? null : String(JSON.stringify(detail)).slice(0, 600) }) }];

const raws = [];
try { for (const it of $('MCP Call').all()) raws.push(parse(it.json)); } catch (e) {}
const errored = raws.find((x) => x && (x._toolError || x._rpcError));

if (r.action === 'send_reply') {
  if (errored) return fail('Alta refused the send', errored._toolError || errored._rpcError);
  const receipt = raws.find((x) => x && !x._toolError) || null;
  if (!receipt) return fail('Alta answered nothing readable on the send', raws[0]);
  return [{ json: Object.assign({}, base, { sentAt: new Date().toISOString(), chars: String(r.body || '').length, receipt }) }];
}

if (r.action === 'get_prospect') {
  if (errored) return fail('Alta refused the prospect read', errored._toolError || errored._rpcError);
  const pr = raws[0] || {};
  let person = {};
  try { const pp = parse($('MCP Person').first().json); if (pp && !pp._toolError && !pp._rpcError) person = pp; } catch (e) {}
  return [{ json: Object.assign({}, base, { prospect: {
    prospectId: pr.id || r.prospectId, personId: pr.personId || null, campaignId: pr.campaignId || null, repId: pr.repId || null,
    status: pr.status || null, sequenceStatus: pr.sequenceStatus || null, sourcedAt: pr.createdAt || null,
    firstName: person.firstName || null, lastName: person.lastName || null,
    name: [person.firstName, person.lastName].filter(Boolean).join(' ') || null,
    title: person.title || null, email: person.email || null, linkedinUrl: person.linkedinUrl || null,
    city: person.city || null, state: person.state || null, country: person.country || null,
    companyId: person.companyId || null, customFields: person.customFields || null,
  } }) }];
}

// get_thread: every message Alta holds for this prospect, merged, deduped, oldest first.
const msgs = [];
for (const x of raws) { if (!x || typeof x !== 'object' || x._toolError || x._rpcError) continue; for (const m of (x.linkedinMessages || [])) { if (m && m.id) msgs.push(m); } }
if (!msgs.length && errored) return fail('Alta refused the thread read', errored._toolError || errored._rpcError);
const seen = new Set(); const uniq = [];
for (const m of msgs) { if (!seen.has(m.id)) { seen.add(m.id); uniq.push(m); } }
uniq.sort((a, b) => new Date(a.happenedAt || a.createdAt || 0) - new Date(b.happenedAt || b.createdAt || 0));
const fmt = (ts) => { const d = new Date(ts); return isNaN(d.getTime()) ? '' : d.toLocaleString('sv-SE', { timeZone: 'Asia/Jerusalem' }).slice(0, 16); };
const iso = (t) => { const d = new Date(t); return isNaN(d.getTime()) ? null : d.toISOString(); };
const blocks = []; const them = []; const us = [];
for (const m of uniq) {
  const txt = String(m.text || m.body || '').trim();
  if (txt.length < 2) continue;
  const dir = m.type === 'received' ? 'THEM' : 'US';
  const t = m.happenedAt || m.createdAt || '';
  if (t) (dir === 'THEM' ? them : us).push(t);
  blocks.push('**[' + fmt(t) + '] ' + dir + ':**\n' + txt);
}
return [{ json: Object.assign({}, base, {
  messages: uniq.length,
  thread: blocks.join('\n\n'),
  lastEngaged: them.length ? iso(them[them.length - 1]) : null,
  lastTouch: us.length ? iso(us[us.length - 1]) : null,
  firstEngagement: them.length ? iso(them[0]) : null,
  lastIsOurs: !!(us.length && (!them.length || new Date(us[us.length - 1]) > new Date(them[them.length - 1]))),
}) }];
