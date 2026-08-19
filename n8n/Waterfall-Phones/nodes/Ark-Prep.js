// Tier 2: AI-Ark mobile-phone-finder (v2, Clay-compatible: HTTP 200 on miss).
// LinkedIn URL alone, or domain + full name. 5 credits per found number, 0 on miss.
const j0 = $input.first().json;
const j = Object.assign({}, j0); delete j.callBody;
if (j._invalid) return [{ json: Object.assign({}, j, { _call: 0 }) }];
const acc = j.acc, p = j.person;
if (acc.phone) return [{ json: Object.assign({}, j, { _call: 0 }) }];
const name = (p.full_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim()).trim();
let callBody = null;
if (p.linkedin) callBody = { linkedin: p.linkedin };
else if (p.domain && name) callBody = { domain: p.domain, name };
if (!callBody) { acc.skipped.push('ai-ark: missing linkedin and domain+name'); return [{ json: Object.assign({}, j, { _call: 0 }) }]; }
acc.tried.push('ai-ark');
return [{ json: Object.assign({}, j, { _call: 1, callBody }) }];
