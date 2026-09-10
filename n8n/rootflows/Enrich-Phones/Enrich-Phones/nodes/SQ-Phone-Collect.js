// Tier 1b collected: Supersoniq's unlocked numbers. A direct line resolves the person; a toll-free
// switchboard is held aside as the last resort. 404 is a clean miss (no phone on file, nothing
// charged); a missing credential or an empty wallet is a skip; anything else is a named failure.
const state=$('SQ Resolve Collect').first().json;
let reqs=[]; try{ reqs=$('SQ Phone Requests').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('SQ Phone Unlock').all(); }catch(e){}
const st=state.stats; st.skips=st.skips||{};
const note=(k)=>{ st.skips[k]=(st.skips[k]||0)+1; };
const digits=(v)=>String(v||'').replace(/\D/g,'');
const plausible=(v)=>{ const d=digits(v); return d.length>=7&&d.length<=15; };
const isTollFree=(v)=>{ let x=digits(v); if(x.length===11&&x.charAt(0)==='1') x=x.slice(1); return x.length===10&&/^(?:800|833|844|855|866|877|888)/.test(x); };
answers.forEach((it,i)=>{
  const q=reqs[i]; if(!q) return;
  const r=state.rows[q.rowId]; if(!r||r.resolved) return;
  const j=it.json||{};
  st.sqUnlockCalls++;
  if(j.error&&j.statusCode===undefined){
    const m=String((j.error&&(j.error.message||j.error.description))||j.error||'call failed');
    if(/credential/i.test(m)) note('Supersoniq: no credential on the node');
    else if(/credit|quota|payment|insufficient|balance/i.test(m)) note('Supersoniq: out of credits');
    else { r.error='supersoniq phone: '+m.slice(0,120); note('Supersoniq phone failed: '+m.slice(0,120)); }
    return;
  }
  let b=(j.body!==undefined)?j.body:j;
  if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b=null; } }
  const code=Number(j.statusCode||0);
  if(code===404) return; // no phone on file: a clean miss, nothing charged
  if(!b||typeof b!=='object'||code>=400){
    const msg=(b&&((b.detail&&JSON.stringify(b.detail).slice(0,150))||b.error||b.message))||('HTTP '+(code||'?'));
    if(code===402||/credit|quota|payment|insufficient|balance/i.test(String(msg))) note('Supersoniq: out of credits');
    else { r.error='supersoniq phone: '+String(msg).slice(0,120); note('Supersoniq phone failed: '+String(msg).slice(0,120)); }
    return;
  }
  let phone='';
  const dig=(x,depth)=>{ if(phone||!x||depth>3) return; if(typeof x==='string') return; if(Array.isArray(x)){ x.forEach(v=>dig(v,depth+1)); return; } if(typeof x==='object'){ for(const k of ['phone','phone_number','mobile','mobile_phone','mobile_number','number']){ if(typeof x[k]==='string'&&plausible(x[k])){ phone=x[k].trim(); return; } } for(const v of Object.values(x)) dig(v,depth+1); } };
  dig(b,0);
  if(!phone) return;
  if(isTollFree(phone)){ if(!r.tf) r.tf={ phone, provider:'Supersoniq', type:'toll-free' }; }
  else { r.resolved={ phone, provider:'Supersoniq', type:'direct' }; st.sqFound++; }
});
return [{ json:state }];
