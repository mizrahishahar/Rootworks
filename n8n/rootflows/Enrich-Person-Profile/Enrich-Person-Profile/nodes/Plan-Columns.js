// Plan Columns: one meta-API call per profile column People lacks. Runs only when there is
// something to create; the IF before it routes an empty plan straight to the row read.
const c=$('Check Columns').first().json;
return (c.creates||[]).map(x=>({ json:x }));
