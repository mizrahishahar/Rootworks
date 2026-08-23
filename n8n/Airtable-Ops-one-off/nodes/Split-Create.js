// One-off: create records. Body: { base, table, records:[{fields}] }. Batches of 10, typecast on.
const b=($input.first().json||{}).body||{};
if(!b.base||!b.table||!Array.isArray(b.records)||!b.records.length) throw new Error("need base, table, records[]");
const out=[]; for(let i=0;i<b.records.length;i+=10) out.push({ json:{ base:b.base, table:b.table, records:b.records.slice(i,i+10) } });
return out;
