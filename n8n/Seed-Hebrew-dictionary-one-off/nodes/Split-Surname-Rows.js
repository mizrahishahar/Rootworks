const m=$('Merge Dictionary').first().json;
return (m.surnames||[]).map(function(r){ return { json: r }; });