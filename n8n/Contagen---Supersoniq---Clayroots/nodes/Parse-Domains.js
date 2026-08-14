// Pass every ContaGen row through, and emit the unique domain set for the Supersoniq stage.
const rows = $input.all().map(i => i.json);
const domains = [];
const seen = new Set();
for (const r of rows) {
  const d = String(r.Domain || r.domain || r.company_domain || '').trim().toLowerCase();
  if (d && !seen.has(d)) { seen.add(d); domains.push(d); }
}
return [{ json: { _domains: domains, _domain_count: domains.length, _row_count: rows.length } }];