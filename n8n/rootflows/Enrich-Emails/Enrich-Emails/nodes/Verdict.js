// Verdict: one write per row from the final state. The Email field is never rewritten: it holds what
// the contact providers delivered, and it is the only thing Verify Catch-alls ever sends to
// BounceBan. The one exception is a row that had no address at all and LeadMagic found one: that
// address is written into Email, as a provider would have written it.
//   done: Final Email, Email Provider (the candidate's origin), Email Verified By MillionVerifier,
//         Email Verified At, Status done.
//   catch-all domain, a provider address in Email: Status verifying, nothing else written.
//         Verify Catch-alls submits the Email field as it is, each address once.
//   catch-all domain, Email empty, LeadMagic found an address: Email = that address, Status verifying.
//   catch-all domain, Email empty, LeadMagic found nothing: no_email_found.
//   normal domain, nothing found: no_email_found. Nothing could be asked, or every verifier answer
//         an error: error, retryable.
// A guess never reaches BounceBan: on a catch-all domain guesses are never made, and a guess that
// answered catch-all only means the domain is catch-all and Email was empty, the LeadMagic case.
const state=$('MV LM Collect').first().json;
const now=new Date().toISOString();
const out=[];
const st={ done:0, verifying:0, noEmail:0, errored:0, byProvider:{} };
for(const id of state.order){
  const r=state.rows[id];
  const row={ id:id };
  const db=r.candidates.filter(c=>c.origin==='database');
  const lm=r.candidates.filter(c=>c.origin==='LeadMagic');
  if(r.resolved){
    row['Final Email']=r.resolved.email; row['Email Provider']=r.resolved.origin; row['Email Verified By']=r.resolved.by||'MillionVerifier'; row['Email Verified At']=now; row['Status']='done';
    st.done++; st.byProvider[r.resolved.origin]=(st.byProvider[r.resolved.origin]||0)+1;
  } else if(r.catchAll){
    if(db.length){ row['Status']='verifying'; st.verifying++; }
    else if(lm.length){ row['Email']=lm.map(c=>c.email).join(', '); row['Status']='verifying'; st.verifying++; }
    else { row['Status']='no_email_found'; st.noEmail++; }
  } else {
    const answered=r.candidates.some(c=>c.mv&&c.mv!=='error');
    if(r.candidates.length&&!answered){ row['Status']='error'; st.errored++; }
    else if(!r.candidates.length&&!(r.first&&r.domain)){ row['Status']='error'; st.errored++; }
    else { row['Status']='no_email_found'; st.noEmail++; }
  }
  out.push({ json:row });
}
if(out.length) out[0].json._stats=Object.assign({}, st, state.stats);
if(!out.length) return [{ json:{ _empty:true, _stats:Object.assign({}, st, state.stats) } }];
return out;
