const items = $input.all();
const bad = items.filter(i => !i.json || !Array.isArray(i.json.results));
if (items.length && bad.length === items.length) {
  throw new Error('Supersoniq enrich failed on all ' + items.length + ' chunk(s): ' + JSON.stringify(bad[0].json).slice(0, 500));
}
return items.filter(i => i.json && Array.isArray(i.json.results));