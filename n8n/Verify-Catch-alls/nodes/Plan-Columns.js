// Plan Columns: one meta-API call per own field the table lacks.
const c=$('Check Columns').first().json;
return (c.creates||[]).map(x=>({ json:x }));
