// Tier 4 collected: Prospeo's verdicts, aligned to PR Requests. NO_MATCH is a clean miss,
// INSUFFICIENT_CREDITS a named skip, a masked or unrevealed mobile a miss that is never written.
// A person with no usable identifier was never asked, and the run row says so.
const state=$('LM Collect').first().json;
let reqs=[]; try{ reqs=$('PR Requests').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('PR Mobile Finder').all(); }catch(e){}
const st=state.stats; st.skips=st.skips||{};
const note=(k)=>{ st.skips[k]=(st.skips[k]||0)+1; };
const digits=(v)=>String(v||'').replace(/\D/g,'');
const plausible=(v)=>{ const d=digits(v); return d.length>=7&&d.length<=15; };
const isTollFree=(v)=>{ let x=digits(v); if(x.length===11&&x.charAt(0)==='1') x=x.slice(1); return x.length===10&&/^(?:800|833|844|855|866|877|888)/.test(x); };
answers.forEach((it,i)=>{
  const q=reqs[i]; if(!q) return;
  const r=state.rows[q.rowId]; if(!r||r.resolved) return;
  const j=it.json||{};
  st.prCalls++;
  if(j.error&&j.statusCode===undefined&&j.person===undefined){
    const m=String((j.error&&(j.error.message||j.error.description))||j.error||'call failed');
    if(/credential/i.test(m)) note('Prospeo: no credential on the node');
    else if(/credit|quota|payment|insufficient/i.test(m)) note('Prospeo: out of credits');
    else { r.error='prospeo: '+m.slice(0,120); note('Prospeo failed: '+m.slice(0,120)); }
    return;
  }
  let b=(j.body!==undefined)?j.body:j;
  if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b=null; } }
  const code=Number(j.statusCode||0);
  if(!b||typeof b!=='object'){ r.error='prospeo: unparseable response'; note('Prospeo failed: unparseable response'); return; }
  const errCode=String(b.error_code||'');
  if(b.error===true||errCode){
    if(errCode==='NO_MATCH') return; // clean miss
    if(errCode==='INSUFFICIENT_CREDITS'||code===402){ note('Prospeo: out of credits'); return; }
    r.error='prospeo: '+(errCode||'HTTP '+code); note('Prospeo failed: '+(errCode||'HTTP '+code));
    return;
  }
  const person=b.person||(b.response&&b.response.person)||{};
  let cand=person.mobile||person.mobile_phone||person.phone||'';
  if(cand&&typeof cand==='object'){ if(cand.revealed===false) cand=''; else cand=cand.number||cand.mobile||cand.raw||cand.international||''; }
  cand=String(cand||'').trim();
  if(!cand||cand.indexOf('*')>=0||!plausible(cand)) return;
  if(isTollFree(cand)){ if(!r.tf) r.tf={ phone:cand, provider:'Prospeo', type:'toll-free' }; }
  else { r.resolved={ phone:cand, provider:'Prospeo', type:'direct' }; st.prFound++; }
});
for(const id of state.order){ const r=state.rows[id]; if(r.resolved) continue; if(!r.email&&!(r.domain&&(r.fullName||(r.firstRaw&&r.lastRaw)))&&!r.linkedin) note('Prospeo: no usable identifier'); }
return [{ json:state }];
