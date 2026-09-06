// One DNS lookup per sending domain, plus the two controls, in the same pass. A resolver that
// is being refused by SURBL answers "clean" for everything, and that failure is indistinguishable
// from a healthy fleet without them: the permanent test point must come back listed and
// google.com must come back clean, or the whole pass is worthless.
const pages = $('List Email Accounts').all().map(i => i && i.json).filter(Boolean);
const accounts = [];
for (const p of pages) { if (Array.isArray(p.accounts)) accounts.push(...p.accounts); }
const domains = [...new Set(accounts.map(a => String(a.email || '').split('@')[1] || '').filter(Boolean).map(d => d.toLowerCase()))];
const q = (name) => 'https://dns.google/resolve?name=' + encodeURIComponent(name + '.multi.surbl.org') + '&type=A';
const calls = [
  { kind: 'control-listed', domain: 'surbl-org-permanent-test-point.com', url: q('surbl-org-permanent-test-point.com') },
  { kind: 'control-clean', domain: 'google.com', url: q('google.com') },
].concat(domains.map(d => ({ kind: 'domain', domain: d, url: q(d) })));
return calls.map(c => ({ json: c }));
