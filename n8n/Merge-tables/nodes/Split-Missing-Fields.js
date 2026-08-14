const p = $('Plan Fields').first().json;
return (p.missingFields || []).map(function (f) { return { json: f }; });