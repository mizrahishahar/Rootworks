// Stamp Rows: Contacts Pulled At = now on every company of the run, asked or not, found or not,
// in tens, one item per Airtable request (Stamp Companies PATCHes by record id, 200 ms apart).
// Not Sourced drops them; Not Covered keeps the zero-contact ones visible.
const plan=$('Plan Companies').first().json;
const now=new Date().toISOString();
const ids=(plan.companies||[]).map(c=>c.recordId).filter(Boolean);
const out=[];
for(let i=0;i<ids.length;i+=10){ const part=ids.slice(i,i+10); out.push({ json:{ body:{ records:part.map(id=>({ id, fields:{ 'Contacts Pulled At':now } })), typecast:true }, size:part.length } }); }
if(!out.length) return [{ json:{ _none:true, size:0 } }];
return out;
