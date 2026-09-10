// Verdict: one write per row from the final state. done: Final Email, Email Provider (the
// candidate's origin), Email Verified By MillionVerifier, Email Verified At, Status done, Email
// Candidates cleared. A catch-all row: Status verifying, Email Candidates = up to three candidates
// in priority order as "email|origin" (database, Blitz, LeadMagic, then the pattern guesses) for
// Verify Catch-alls, which picks the first BounceBan says is deliverable. Nothing found on a normal
// domain: no_email_found. Nothing could be asked (no name, no domain, every verifier answer an
// error): error, retryable. Email is rewritten as the full candidate list so a later pass starts
// from everything that was ever found.
const state=$('MV LM Collect').first().json;
const now=new Date().toISOString();
const PRI={ database:0, Blitz:1, LeadMagic:2, pattern:3 };
const out=[];
const st={ done:0, verifying:0, noEmail:0, errored:0, byProvider:{} };
for(const id of state.order){
  const r=state.rows[id];
  const all=Array.from(new Set(r.candidates.map(c=>c.email)));
  const row={ id:id, 'Email':all.join(', ') };
  if(r.resolved){
    row['Final Email']=r.resolved.email; row['Email Provider']=r.resolved.origin; row['Email Verified By']=r.resolved.by||'MillionVerifier'; row['Email Verified At']=now; row['Status']='done'; row['Email Candidates']='';
    st.done++; st.byProvider[r.resolved.origin]=(st.byProvider[r.resolved.origin]||0)+1;
  } else if(r.catchAll){
    const cands=r.candidates.slice().sort((a,b)=>(PRI[a.origin]-PRI[b.origin]));
    const guesses=cands.filter(c=>c.origin==='pattern');
    // on a catch-all domain the guesses were never made (no MillionVerifier there); add the two most
    // common shapes so BounceBan has something to rank when no provider delivered an address
    if(!guesses.length&&r.first&&r.domain){ const g=[ (r.last?(r.first+'.'+r.last):''), r.first ].filter(Boolean).map(l=>({ email:l+'@'+r.domain, origin:'pattern' })); for(const c of g){ if(!cands.some(x=>x.email===c.email)) cands.push(c); } }
    const pick=cands.slice(0,3);
    row['Status']='verifying'; row['Email Candidates']=pick.map(c=>c.email+'|'+c.origin).join(', '); row['Email']=Array.from(new Set(all.concat(pick.map(c=>c.email)))).join(', ');
    st.verifying++;
  } else {
    const tried=r.candidates.filter(c=>c.mv&&c.mv!=='error'&&c.mv!=='unknown').length;
    const answered=r.candidates.some(c=>c.mv&&c.mv!=='error');
    if(r.candidates.length&&!answered){ row['Status']='error'; st.errored++; }
    else { row['Status']='no_email_found'; row['Email Candidates']=''; st.noEmail++; }
    if(!tried&&!r.candidates.length){ row['Status']=r.first&&r.domain?'no_email_found':'error'; }
  }
  out.push({ json:row });
}
if(out.length) out[0].json._stats=Object.assign({}, st, state.stats);
if(!out.length) return [{ json:{ _empty:true, _stats:Object.assign({}, st, state.stats) } }];
return out;
