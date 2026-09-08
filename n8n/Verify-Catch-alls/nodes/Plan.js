// Plan: every row Status = verifying in the read -> up to three BounceBan submissions per row, in
// priority order. The candidates come from Email Candidates ("email|origin, ...", written by Enrich
// Emails); a row without it (an older row, or one marked by hand) falls back to the Email cell with
// origin database. One item per address; the row's position order decides which deliverable wins.
const rows=$input.all().map(i=>i.json||{}).filter(j=>j.id);
const clean=(s)=>String(s||'').trim().toLowerCase();
const isEmail=(e)=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
const out=[]; let rowsIn=0, noCandidates=0;
for(const r of rows){
  const f=r.fields||{};
  if(String(f.Status||'')!=='verifying') continue;
  rowsIn++;
  let cands=String(f['Email Candidates']||'').split(',').map(s=>s.trim()).filter(Boolean).map(s=>{ const p=s.split('|'); return { email:clean(p[0]), origin:(p[1]||'database').trim() }; }).filter(c=>isEmail(c.email));
  if(!cands.length) cands=String(f.Email||'').split(/[,;\s]+/).map(clean).filter(isEmail).map(e=>({ email:e, origin:'database' }));
  const seen=new Set(); cands=cands.filter(c=>{ if(seen.has(c.email)) return false; seen.add(c.email); return true; }).slice(0,3);
  if(!cands.length){ noCandidates++; out.push({ json:{ rowId:r.id, email:'', origin:'', pos:0, _none:true } }); continue; }
  cands.forEach((c,i)=>out.push({ json:{ rowId:r.id, email:c.email, origin:c.origin, pos:i } }));
}
if(!out.length) return [{ json:{ _empty:true, _stats:{ rowsIn, noCandidates } } }];
out[0].json._stats={ rowsIn, noCandidates, submissions:out.filter(x=>!x.json._none).length };
return out;
