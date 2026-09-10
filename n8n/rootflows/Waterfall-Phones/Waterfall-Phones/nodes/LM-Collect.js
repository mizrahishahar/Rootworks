// Tier 3 collected: LeadMagic's answers, aligned to LM Requests. Out of credits (the 402 class) is a
// SKIP named on the run row, not an error: the account state, not the lead, refused the call.
// A person with no email was never asked, and the run row says so.
const state=$('Ark Collect').first().json;
let reqs=[]; try{ reqs=$('LM Requests').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('LM Mobile Finder').all(); }catch(e){}
const st=state.stats; st.skips=st.skips||{};
const note=(k)=>{ st.skips[k]=(st.skips[k]||0)+1; };
const digits=(v)=>String(v||'').replace(/\D/g,'');
const plausible=(v)=>{ const d=digits(v); return d.length>=7&&d.length<=15; };
const isTollFree=(v)=>{ let x=digits(v); if(x.length===11&&x.charAt(0)==='1') x=x.slice(1); return x.length===10&&/^(?:800|833|844|855|866|877|888)/.test(x); };
answers.forEach((it,i)=>{
  const q=reqs[i]; if(!q) return;
  const r=state.rows[q.rowId]; if(!r||r.resolved) return;
  const j=it.json||{};
  st.lmCalls++;
  if(j.error&&j.statusCode===undefined&&j.mobile_number===undefined){
    const m=String((j.error&&(j.error.message||j.error.description))||j.error||'call failed');
    if(/credential/i.test(m)) note('LeadMagic: no credential on the node');
    else if(/credit|payment required|insufficient|quota/i.test(m)) note('LeadMagic: out of credits');
    else { r.error='leadmagic: '+m.slice(0,120); note('LeadMagic failed: '+m.slice(0,120)); }
    return;
  }
  let b=(j.body!==undefined)?j.body:j;
  if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b={}; } }
  if(!b||typeof b!=='object') b={};
  const code=Number(j.statusCode||0);
  const msg=String(b.message||b.error||'');
  if(code===402||/credit|payment required|insufficient|quota/i.test(msg)){ note('LeadMagic: out of credits'); return; }
  if(code>=400){ r.error='leadmagic: HTTP '+code; note('LeadMagic failed: HTTP '+code+(msg?' ('+msg.slice(0,100)+')':'')); return; }
  const mobile=String(b.mobile_number||b.mobile||'').trim();
  if(!mobile||!plausible(mobile)) return;
  if(isTollFree(mobile)){ if(!r.tf) r.tf={ phone:mobile, provider:'LeadMagic', type:'toll-free' }; }
  else { r.resolved={ phone:mobile, provider:'LeadMagic', type:'direct' }; st.lmFound++; }
});
for(const id of state.order){ const r=state.rows[id]; if(r.resolved) continue; if(!r.email) note('LeadMagic: no email on the row'); }
return [{ json:state }];
