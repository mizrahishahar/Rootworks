// Plan: every row Status = verifying in the read (when the caller passed rowIds, only those rows:
// the rows Enrich Emails just marked, never an older run's leftovers) -> exactly ONE BounceBan
// submission per row: the first address in the row's Email field, the one the contact providers
// put first (or the one LeadMagic found). Never more than one per row, never a guess (ruled
// 2026-09-16). A second address in Email is ignored, not submitted.
const p=$('Params').first().json;
const only=new Set((p.rowIds||[]).map(String));
const rows=$input.all().map(i=>i.json||{}).filter(j=>j.id&&(!only.size||only.has(String(j.id))));
const clean=(s)=>String(s||'').trim().toLowerCase();
const isEmail=(e)=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
const out=[]; let rowsIn=0, noCandidates=0;
for(const r of rows){
  const f=r.fields||{};
  if(String(f.Status||'')!=='verifying') continue;
  rowsIn++;
  const first=String(f.Email||'').split(/[,;\s]+/).map(clean).filter(isEmail)[0]||'';
  if(!first){ noCandidates++; out.push({ json:{ rowId:r.id, email:'', origin:'', pos:0, _none:true } }); continue; }
  out.push({ json:{ rowId:r.id, email:first, origin:'database', pos:0 } });
}
if(!out.length) return [{ json:{ _empty:true, _stats:{ rowsIn, noCandidates, submissions:0, scoped:only.size } } }];
out[0].json._stats={ rowsIn, noCandidates, submissions:out.filter(x=>!x.json._none).length, scoped:only.size };
return out;
