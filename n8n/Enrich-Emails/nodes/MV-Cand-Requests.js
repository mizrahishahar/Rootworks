// MV Cand Requests: one MillionVerifier call per untried candidate on every row that is not resolved and
// not on a catch-all domain (a catch-all domain gets no MillionVerifier: its verdict is the same for
// every address there). Candidates on catch-all rows are marked tried without a call. Emits
// {_none:true} when there is nothing to verify, so the IF after it skips the HTTP node.
const state=$('Prep').first().json;
const out=[];
for(const id of state.order){
  const r=state.rows[id];
  if(r.resolved) continue;
  for(const c of r.candidates){
    if(c.mv) continue;
    if(r.catchAll){ c.mv='catch_all'; continue; }
    out.push({ json:{ rowId:id, email:c.email, origin:c.origin } });
  }
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
