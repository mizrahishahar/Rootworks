// Plan: every row Status = verifying in the read (when the caller passed rowIds, only those rows:
// the rows Enrich Emails just marked, never an older run's leftovers) -> exactly ONE BounceBan
// submission per row: the first address in the row's Email field, the one the contact providers
// put first (or the one LeadMagic found). Never more than one per row, never a guess (ruled
// 2026-09-16). A second address in Email is ignored, not submitted.
// Hard cap: one run submits at most MAX_SUBMITS addresses (paid for 2026-09-16: one run planned
// 11,877). Rows beyond the cap are not touched, stay verifying, and are counted as capped in the
// log; the Operator launches again for them on purpose.
const MAX_SUBMITS=500;
const p=$('Params').first().json;
const only=new Set((p.rowIds||[]).map(String));
const rows=$input.all().map(i=>i.json||{}).filter(j=>j.id&&(!only.size||only.has(String(j.id))));
const clean=(s)=>String(s||'').trim().toLowerCase();
const isEmail=(e)=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
const out=[]; let rowsIn=0, noCandidates=0, capped=0, submissions=0;
for(const r of rows){
  const f=r.fields||{};
  if(String(f.Status||'')!=='verifying') continue;
  rowsIn++;
  const first=String(f.Email||'').split(/[,;\s]+/).map(clean).filter(isEmail)[0]||'';
  if(!first){ noCandidates++; out.push({ json:{ rowId:r.id, email:'', origin:'', pos:0, _none:true } }); continue; }
  if(submissions>=MAX_SUBMITS){ capped++; continue; }
  submissions++;
  out.push({ json:{ rowId:r.id, email:first, origin:'database', pos:0 } });
}
const stats={ rowsIn, noCandidates, submissions, capped, cap:MAX_SUBMITS, scoped:only.size };
if(!out.length) return [{ json:{ _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
