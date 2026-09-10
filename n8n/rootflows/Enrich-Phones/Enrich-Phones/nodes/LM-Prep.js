// Tier 3: LeadMagic mobile-finder by work email.
const j0 = $input.first().json;
const j = Object.assign({}, j0); delete j.callBody;
if (j._invalid) return [{ json: Object.assign({}, j, { _call: 0 }) }];
const acc = j.acc, p = j.person;
if (acc.phone) return [{ json: Object.assign({}, j, { _call: 0 }) }];
if (!p.email) { acc.skipped.push('leadmagic: no email'); return [{ json: Object.assign({}, j, { _call: 0 }) }]; }
acc.tried.push('leadmagic');
return [{ json: Object.assign({}, j, { _call: 1, callBody: { work_email: p.email } }) }];
