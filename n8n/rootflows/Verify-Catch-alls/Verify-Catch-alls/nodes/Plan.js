// Plan: every row Status = verifying in the read (when the caller passed rowIds, only those rows:
// the rows Enrich Emails just marked, never an older run's leftovers) -> one BounceBan submission
// per address in the row's Email field. Email is what the contact providers delivered, or the one
// address LeadMagic found; usually one address, sometimes two or three, never a guess. Each address
// is submitted once; the first deliverable in field order wins.
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
  const seen=new Set();
  const cands=String(f.Email||'').split(/[,;\s]+/).map(clean).filter(isEmail).filter(e=>{ if(seen.has(e)) return false; seen.add(e); return true; }).map(e=>({ email:e, origin:'database' }));
  if(!cands.length){ noCandidates++; out.push({ json:{ rowId:r.id, email:'', origin:'', pos:0, _none:true } }); continue; }
  cands.forEach((c,i)=>out.push({ json:{ rowId:r.id, email:c.email, origin:c.origin, pos:i } }));
}
if(!out.length) return [{ json:{ _empty:true, _stats:{ rowsIn, noCandidates, submissions:0, scoped:only.size } } }];
out[0].json._stats={ rowsIn, noCandidates, submissions:out.filter(x=>!x.json._none).length, scoped:only.size };
return out;
