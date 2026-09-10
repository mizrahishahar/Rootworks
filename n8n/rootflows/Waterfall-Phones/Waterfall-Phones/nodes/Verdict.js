// Verdict: one write per row from the final state, the phone lane only. A direct number wins; a
// toll-free switchboard is written last and labelled, never disguised as a direct line.
//   resolved -> Final Phone (E.164), Phone Provider, Phone Type, Phone Found At, Phone Status done
//   nothing, but the row could be asked -> Phone Status no_phone_found
//   a named provider failure, or every provider unavailable -> Phone Status error (retryable)
//   nothing could be asked (no domain, no name, no email, no LinkedIn URL) -> Phone Status error
// The Phone cell is never written: it belongs to Enrich Contacts. Nothing else on the row is touched.
const state=$('PR Collect').first().json;
const now=new Date().toISOString();
const toE164=(raw)=>{ const t=String(raw||'').trim(); if(!t) return ''; const d=t.replace(/\D/g,''); if(t.charAt(0)==='+') return '+'+d; if(d.length===11&&d.charAt(0)==='1') return '+'+d; if(d.length===10&&d.charAt(0)!=='0') return '+1'+d; return t; };
const skips=Object.keys(state.stats.skips||{});
const down=(name)=>skips.some(k=>k.indexOf(name)===0&&/no credential|out of credits/.test(k));
const allDown=down('Supersoniq')&&down('AI-Ark')&&down('LeadMagic')&&down('Prospeo');
state.stats.providersDown=!!allDown;
const st={ done:0, tollFreeOnly:0, noPhone:0, errored:0, byProvider:{} };
const out=[];
for(const id of state.order){
  const r=state.rows[id];
  const row={ id:id };
  const hit=r.resolved||r.tf||null;
  if(hit){
    row['Final Phone']=toE164(hit.phone);
    row['Phone Provider']=hit.provider;
    row['Phone Type']=hit.type;
    row['Phone Found At']=now;
    row['Phone Status']='done';
    st.done++;
    if(hit.type==='toll-free') st.tollFreeOnly++;
    st.byProvider[hit.provider]=(st.byProvider[hit.provider]||0)+1;
  } else {
    const askable=!!((r.domain&&(r.fullName||r.first))||r.linkedin||r.email);
    if(r.error||allDown||!askable){ row['Phone Status']='error'; st.errored++; }
    else { row['Phone Status']='no_phone_found'; st.noPhone++; }
  }
  out.push({ json:row });
}
state.stats.tollFreeOnly=st.tollFreeOnly;
if(out.length) out[0].json._stats=Object.assign({}, st, state.stats);
if(!out.length) return [{ json:{ _empty:true, _stats:Object.assign({}, st, state.stats) } }];
return out;
