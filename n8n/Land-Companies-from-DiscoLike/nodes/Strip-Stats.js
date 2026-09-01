// Strip Stats: the _stats carrier rides on row 0 for the log; it must not reach the upsert.
return $input.all().map(i=>{ const j=Object.assign({}, i.json); delete j._stats; delete j._empty; return { json: j }; });
