const g=$input.first().json;
return g.missingFields.map(n=>({ json: { name: n } }));