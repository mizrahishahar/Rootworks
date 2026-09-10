// Verdict: per row, the first candidate by position that BounceBan called deliverable wins: Final
// Email, Email Provider = its origin, Email Verified By BounceBan, Email Verified At, Status done,
// Email Candidates cleared. Every candidate undeliverable or risky or unknown: no_email_found
// (risky is not deployable). Any candidate still without a verdict at the cap: nothing written,
// the row stays verifying for the next sweep. A row with no candidate at all: no_email_found.
const now=new Date().toISOString();
const settled=$input.all().map(i=>i.json||{});
let planned=[]; try{ planned=$('Plan').all().map(i=>i.json||{}).filter(j=>!j._empty); }catch(e){}
const byRow={};
for(const p of planned){ const r=byRow[p.rowId]||(byRow[p.rowId]={ cands:[], none:!!p._none }); if(!p._none) r.cands.push({ email:p.email, origin:p.origin, pos:p.pos, result:'', id:'' }); }
for(const s of settled){ const r=byRow[s.rowId]; if(!r) continue; const c=r.cands.find(x=>x.email===s.email); if(c){ c.result=s.result||''; c.id=s.id||''; c.submitErr=s._submitErr||''; } }
const out=[]; const st={ rows:0, done:0, noEmail:0, pending:0, byProvider:{}, submitted:0, refused:0, verdicts:{} };
for(const id of Object.keys(byRow)){
  const r=byRow[id]; st.rows++;
  if(r.none||!r.cands.length){ out.push({ json:{ id, 'Status':'no_email_found', 'Email Candidates':'' } }); st.noEmail++; continue; }
  r.cands.sort((a,b)=>a.pos-b.pos);
  for(const c of r.cands){ if(c.id) st.submitted++; else st.refused++; if(c.result) st.verdicts[c.result]=(st.verdicts[c.result]||0)+1; }
  const win=r.cands.find(c=>c.result==='deliverable');
  if(win){ out.push({ json:{ id, 'Final Email':win.email, 'Email Provider':win.origin, 'Email Verified By':'BounceBan', 'Email Verified At':now, 'Status':'done', 'Email Candidates':'' } }); st.done++; st.byProvider[win.origin]=(st.byProvider[win.origin]||0)+1; continue; }
  const open=r.cands.some(c=>c.id&&!c.result);
  if(open){ st.pending++; continue; }
  out.push({ json:{ id, 'Status':'no_email_found', 'Email Candidates':'' } }); st.noEmail++;
}
if(!out.length) return [{ json:{ _empty:true, _stats:st } }];
out[0].json._stats=st;
return out;
