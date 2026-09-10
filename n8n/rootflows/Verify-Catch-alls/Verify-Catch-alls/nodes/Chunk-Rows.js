// Chunk Rows: the verdict rows in tens, one item per Airtable request, PATCHed as {records:[{id,
// fields}], typecast:true} 200 ms apart (typecast lets a new provider's name mint its choice on
// Email Provider). Ids and size ride on the item for the count-back; carriers are stripped.
const rows=$input.all().map(i=>i.json).filter(j=>j&&j.id&&!j._empty);
const out=[];
for(let i=0;i<rows.length;i+=10){
  const part=rows.slice(i,i+10);
  out.push({ json:{ body:{ records:part.map(r=>{ const f={}; for(const k of Object.keys(r)){ if(k!=='id'&&k.charAt(0)!=='_') f[k]=r[k]; } return { id:String(r.id), fields:f }; }), typecast:true }, ids:part.map(r=>String(r.id)), size:part.length } });
}
return out;
