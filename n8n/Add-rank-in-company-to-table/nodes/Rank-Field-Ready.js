const g = $('Table Guard').first().json;
let created = false;
try { created = !!(($('Verify Rank Field').first().json) || {}).created; } catch (e) { created = false; }
return [{ json: Object.assign({}, g, { rankFieldCreated: created }) }];