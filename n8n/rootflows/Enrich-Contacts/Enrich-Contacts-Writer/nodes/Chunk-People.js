// Chunk People: the survivors of Apply DNC in tens, one item per Airtable request. Write People
// PATCHes each as {performUpsert: {fieldsToMergeOn: ["Contact Key"]}, records, typecast} at 200 ms
// apart, ten records per request at five requests per second. A new person is a record without an
// id (matched on Contact Key); a held person being filled (the _id carrier from Merge People) is a
// record WITH its id, which Airtable treats as a plain update inside the same request. The Contact
// Keys and the size ride on the item, never in the body, for the count-back.
const rows=$input.all().map(i=>i.json).filter(j=>j&&!j._empty&&j['Contact Key']);
const out=[];
for(let i=0;i<rows.length;i+=10){
  const part=rows.slice(i,i+10);
  out.push({ json: {
    body: { performUpsert: { fieldsToMergeOn: ['Contact Key'] }, records: part.map(r=>{ const f=Object.assign({}, r); const id=f._id; delete f._id; return id?{ id:id, fields:f }:{ fields:f }; }), typecast: true },
    keys: part.map(r=>String(r['Contact Key']).toLowerCase()),
    updates: part.filter(r=>r._id).length,
    size: part.length
  } });
}
return out;
