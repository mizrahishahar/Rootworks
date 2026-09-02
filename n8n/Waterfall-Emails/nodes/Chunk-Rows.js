// Chunk Rows: the verdict rows in tens, one item per Airtable request. Write Rows PATCHes each as
// {records: [{id, fields}], typecast: true}, 200 ms apart. The Airtable node this replaced sent ONE
// record per request (measured 4.5 rows per second) and blew its own 25 s ceiling on a 90-row batch,
// killing executions 9812/9813 on 2026-09-02; ten per request at five requests per second is 50 rows
// per second and nine requests where there were ninety. The record ids and the size ride on the item,
// never in the body, for the count-back: written rows are counted from the answer's records[], and a
// request that is not 2xx names every id it carried in failed[].
const rows = $input.all().map(i => i.json).filter(j => j && j.id);
const out = [];
for (let i = 0; i < rows.length; i += 10) {
  const part = rows.slice(i, i + 10);
  out.push({ json: {
    body: { records: part.map(r => {
      const f = {};
      for (const k of Object.keys(r)) { if (k !== 'id' && k.charAt(0) !== '_') f[k] = r[k]; }
      return { id: String(r.id), fields: f };
    }), typecast: true },
    ids: part.map(r => String(r.id)),
    size: part.length
  } });
}
return out;
