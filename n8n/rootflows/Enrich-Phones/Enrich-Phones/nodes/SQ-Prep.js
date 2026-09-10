// Tier 1: Supersoniq. Resolve the person to a contact at their company (naked pull,
// has_phone-filtered), then unlock the phone by contact_id. This node decides whether
// to call and builds the resolution request; the unlock request is built in SQ Pick.
const j = $input.first().json;
if (j._invalid) return [{ json: Object.assign({}, j, { _call: 0 }) }];
const acc = j.acc, p = j.person;
const name = (p.full_name || ((p.first_name || '') + ' ' + (p.last_name || '')).trim()).trim();
if (acc.phone) return [{ json: Object.assign({}, j, { _call: 0 }) }];
if (!p.domain || !name) { acc.skipped.push('supersoniq: missing domain or name'); return [{ json: Object.assign({}, j, { _call: 0 }) }]; }
acc.tried.push('supersoniq');
const callBody = { companies: [{ domain: p.domain }], tier: 'naked', per_company_limit: 5, filters: { has_phone: true } };
return [{ json: Object.assign({}, j, { _call: 1, callBody }) }];
