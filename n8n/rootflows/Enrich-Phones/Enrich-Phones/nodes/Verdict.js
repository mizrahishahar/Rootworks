// Verdict: one write per row from the batch's state and FullEnrich's answer, the phone lane only.
//   a number (the held phone cell, or FullEnrich's most probable phone)
//        -> Final Phone (E.164), Phone Provider, Phone Type, Phone Found At, Phone Status done
//   FullEnrich finished and found nothing            -> Phone Status no_phone_found
//   the person could not be asked, the submission was refused, FullEnrich ran out of credits or the
//   45-minute cap passed before it answered            -> Phone Status error (retryable)
// The Phone cell of a People row is never written: it belongs to Enrich Contacts.
// A Hub Contacts row (a launch on named contacts) carries no phone lane: only a number FullEnrich
// found is written there, into phone and Phone Source, and a miss writes nothing.
const state=$('Prep').first().json;
// The carrier arrives on the input: from the poll loop when it settled, from Submit Check when the
// submission was refused; when nobody had to be asked the input is Prep's own item and there is none.
const inp=$input.first().json||{};
const c=(inp._t0!==undefined)?inp:{};
const now=new Date().toISOString();
const toE164=(raw)=>{ const t=String(raw||'').trim(); if(!t) return ''; const d=t.replace(/\D/g,''); if(t.charAt(0)==='+') return '+'+d; if(d.length===11&&d.charAt(0)==='1') return '+'+d; if(d.length===10&&d.charAt(0)!=='0') return '+1'+d; return t; };
const TYPES={ MOBILE:'mobile', LANDLINE:'landline', VOIP:'voip' };
const found={}; for(const x of (c.found||[])) found[x.rowId]=x;
const stopped=c.status==='FINISHED';
let why='';
if(c.submitErr) why=c.submitErr;
else if(c.status==='CREDITS_INSUFFICIENT') why='FullEnrich: out of credits mid-run';
else if(c.status==='CANCELED') why='FullEnrich: the enrichment was canceled';
else if(c.status==='UNREADABLE') why='FullEnrich: the enrichment could not be read back ('+(c.pollErr||'')+')';
else if(c.timedOut) why='FullEnrich: no answer inside the 45-minute cap (enrichment '+(c.enrichmentId||'?')+' may still finish and charge on their side)';
const contacts=state.mode==='contacts';
const st={ done:0, noPhone:0, errored:0, feFound:0, byType:{}, skips:{}, credits:Number(c.credits)||0, enrichmentIds:c.enrichmentId?[c.enrichmentId]:[], providerDown:!!c.submitErr };
const skip=(k,n)=>{ if(n) st.skips[k]=(st.skips[k]||0)+n; };
const out=[];
let unanswered=0;
for(const id of state.order){
  const r=state.rows[id];
  let hit=r.resolved||null;
  if(!hit&&r.asked){ const x=found[id]; if(x&&x.number){ hit={ phone:x.number, provider:'FullEnrich', type:TYPES[String(x.lineType).toUpperCase()]||'unknown' }; st.feFound++; } }
  if(hit){
    st.done++; st.byType[hit.type]=(st.byType[hit.type]||0)+1;
    if(contacts){ if(hit.provider==='FullEnrich') out.push({ json:{ id:id, phone:toE164(hit.phone), 'Phone Source':'FullEnrich' } }); }
    else out.push({ json:{ id:id, 'Final Phone':toE164(hit.phone), 'Phone Provider':hit.provider, 'Phone Type':hit.type, 'Phone Found At':now, 'Phone Status':'done' } });
    continue;
  }
  const answered=r.asked&&(stopped||!!found[id]);
  if(answered){ st.noPhone++; if(!contacts) out.push({ json:{ id:id, 'Phone Status':'no_phone_found' } }); continue; }
  if(r.asked){ unanswered++; st.errored++; }
  if(!contacts) out.push({ json:{ id:id, 'Phone Status':'error' } });
}
skip('Cannot be asked: no LinkedIn URL and no first name + last name + domain', state.stats.notAskable);
if(unanswered) st.unansweredWhy=why||'FullEnrich returned no answer for these people';
const stats=Object.assign({}, state.stats, st);
if(!out.length) return [{ json:{ _empty:true, _stats:stats } }];
out[0].json._stats=stats;
return out;
