const r = $('Table Router').first().json;
return (r.missing || []).map(f => ({ json: { tableId: r.tableId, field: f } }));