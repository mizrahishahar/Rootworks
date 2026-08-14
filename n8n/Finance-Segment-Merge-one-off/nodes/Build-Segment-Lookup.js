const rows = $input.all().map(i => i.json);
const lookup = {};
for (const r of rows) {
  const d = String(r.Domain || r.domain || '').trim().toLowerCase();
  if (!d) continue;
  lookup[d] = {
    segDesc: String(r['Segment Description'] || '').trim(),
    segId: String(r['Segment Id'] || '').trim()
  };
}
return [{ json: { lookup, count: Object.keys(lookup).length } }];