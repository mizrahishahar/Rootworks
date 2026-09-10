const w = ($input.first().json || {}).writes || [];
return w.map(function (r) { return { json: r }; });