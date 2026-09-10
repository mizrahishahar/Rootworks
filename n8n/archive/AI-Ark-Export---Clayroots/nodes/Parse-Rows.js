const rows = $input.all().map(i => i.json);
if (!rows.length) { throw new Error('CSV parse returned no rows.'); }
const stripDomain = (url) => {
  let d = String(url || '').trim().toLowerCase();
  if (!d) return '';
  d = d.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
  return d;
};
const domains = []; const seen = new Set();
for (const r of rows) {
  const d = stripDomain(r['Company Website']);
  if (d && !seen.has(d)) { seen.add(d); domains.push(d); }
}
return [{ json: { _domains: domains, _domain_count: domains.length, _row_count: rows.length } }];