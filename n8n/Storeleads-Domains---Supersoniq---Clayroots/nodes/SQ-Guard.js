const items=$input.all();
const ok=items.filter(i=>i.json&&Array.isArray(i.json.results));
if(!ok.length){ const first=items[0]?JSON.stringify(items[0].json).slice(0,400):'no response'; throw new Error('Supersoniq enrich failed for all '+items.length+' chunk(s): '+first); }
return ok;