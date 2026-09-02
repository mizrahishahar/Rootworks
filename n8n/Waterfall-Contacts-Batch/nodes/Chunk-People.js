// Chunk People: the survivors of Apply DNC in tens, one item per Airtable request. Write People
// PATCHes each as {performUpsert: {fieldsToMergeOn: ["Contact Key"]}, records, typecast} at 200 ms
// apart: the Airtable node sends one record per request (measured 4.5 rows per second, 2026-09-02);
// this writer sends ten per request at five requests per second, 50 rows per second. The Contact
// Keys and the size ride on the item, never in the body, for the count-back: written rows are
// counted from the answer's records[], a failed request counts every record in it as a write error.
const rows=$input.all().map(i=>i.json).filter(j=>j&&!j._empty&&j['Contact Key']);
const out=[];
for(let i=0;i<rows.length;i+=10){
  const part=rows.slice(i,i+10);
  out.push({ json: {
    body: { performUpsert: { fieldsToMergeOn: ['Contact Key'] }, records: part.map(r=>({ fields: r })), typecast: true },
    keys: part.map(r=>String(r['Contact Key']).toLowerCase()),
    size: part.length
  } });
}
return out;
