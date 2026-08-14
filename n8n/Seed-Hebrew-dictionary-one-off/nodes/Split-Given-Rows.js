const m=$('Merge Dictionary').first().json;
return (m.given||[]).map(function(r){ return { json: r }; });