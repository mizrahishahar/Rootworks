// One item per contactless domain. These keys are the CSV columns, nothing else.
const rows = $('Overflow Set').first().json._overflow.rows || [];
return rows.map((r) => ({ json: r }));
