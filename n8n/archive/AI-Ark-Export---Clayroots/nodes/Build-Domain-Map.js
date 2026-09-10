// Company data comes ONLY from the given Domains table - the actual source of truth built
// earlier by DiscoLike/Storeleads/whatever else. Never from the Contacts table, never live from an API.
// No hardcoded field list - a Domains table's real schema varies by what built it, so every
// field the record actually has rides through untouched, under whatever name it really has.
const rows = $input.all().map(i => i.json.fields || i.json || {}).filter(r => r && r.Domain);
const map = {};
for (const r of rows) {
  const d = String(r.Domain || '').trim().toLowerCase();
  if (!d || map[d]) continue;
  const co = {};
  for (const k of Object.keys(r)) {
    if (k === 'Domain') continue;
    const v = r[k];
    co[k] = (v===undefined||v===null) ? '' : v;
  }
  map[d] = co;
}
return [{ json: { map } }];