const items=$input.all().filter(it=>it&&it.json&&it.json.id);
if(!items.length) return [{ json: { _empty:true } }];
return items;