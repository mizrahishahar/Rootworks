// Load Rows: the deploy rows Plan Feed built, one item each, for the feed loop. Nothing but the
// row's own columns rides an item: Create Deploy Row maps every key it sees onto the table.
return $('Plan Feed').all().filter(it => it.json && !it.json._none).map(it => ({ json: it.json }));
