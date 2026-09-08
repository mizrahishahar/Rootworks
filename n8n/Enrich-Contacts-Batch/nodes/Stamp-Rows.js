// Stamp Rows: Contacts Pulled At = now on every company in the batch, tried or not, found or
// not, in tens, one item per Airtable request (Stamp Companies PATCHes each by record id, typecast
// on, 200 ms apart). The Not Sourced view drops them; Not Covered keeps the zero-contact ones
// visible. Writer mode only: the ark pass stamps nothing new.
const plan=$('Plan Batch').first().json;
const now=new Date().toISOString();
const ids=plan.plan.map(c=>c.recordId).filter(Boolean);
const out=[];
for(let i=0;i<ids.length;i+=10){
  const part=ids.slice(i,i+10);
  out.push({ json: { body: { records: part.map(id=>({ id: id, fields: { 'Contacts Pulled At': now } })), typecast: true }, size: part.length } });
}
return out;
