// Split Rows: one item per Companies row for Clean Fields and the upsert. Process Batch has
// already shaped each row to the register and dropped every key the target table lacks.
const rows = $('Process Batch').first().json.rows || [];
return rows.map(r => ({ json: r }));
