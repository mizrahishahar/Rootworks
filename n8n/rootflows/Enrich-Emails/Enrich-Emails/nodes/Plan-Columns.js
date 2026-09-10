// Plan Columns: one meta-API call per own field the table lacks. Runs only when there is something
// to create; the IF before it routes an empty plan straight to the row read.
const c=$('Check Columns').first().json;
return (c.creates||[]).map(x=>({ json:x }));
