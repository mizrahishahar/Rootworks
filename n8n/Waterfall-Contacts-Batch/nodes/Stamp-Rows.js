// Stamp Rows: Contacts Pulled At = now on every company in the batch, tried or not, found or
// not. The Uncovered view drops them; "Tried, empty" keeps the zero-contact ones visible.
// The Airtable node writes these in its own batches of 10.
const plan=$('Plan Batch').first().json;
const now=new Date().toISOString();
return plan.plan.map(c=>({ json: { id: c.recordId, 'Contacts Pulled At': now } }));
