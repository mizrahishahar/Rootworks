// Compact Pause: per-prospect outcome of the pause/resume call, reported by the sequenceStatus
// the API echoed back rather than by the HTTP code alone, so the caller can verify by value.
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
let asked=[]; try{ asked=$('Split Pause Ids').all().map(i=>i.json); }catch(e){}
const resp=$input.all();
const rows=[]; let ok=0, failed=0;
for(let i=0;i<asked.length;i++){
  const a=asked[i]||{};
  if(a._empty) continue;
  const r=(resp[i]&&resp[i].json)||{};
  const http=Number(r.statusCode)||0;
  const body=parse(r.body===undefined?r:r.body)||{};
  const seq=String(body.sequenceStatus||'');
  const good=http>=200&&http<300;
  if(good) ok++; else failed++;
  rows.push({ prospectId:a.prospectId, http, sequenceStatus:seq });
}
return [{ json: { count:rows.length, ok, failed, rows } }];
