// Explode the batch's rows into items for Clean Fields -> Strip Immutable -> Upsert.
return ($('Format Batch').first().json.rows || []).map(r => ({ json: r }));
