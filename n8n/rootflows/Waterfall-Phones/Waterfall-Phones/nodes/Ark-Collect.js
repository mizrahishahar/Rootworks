// Tier 2 collected: the AI-Ark envelope, aligned to Ark Requests. HTTP is always 200; body.status
// 200 = hit (numbers nested in data.data as arrays of strings), 404 = clean miss, 402 or a credit
// message = a named skip, anything else = a named failure. A person with neither a LinkedIn URL nor
// domain + name was never asked, and the run row says so.
const state=$('SQ Phone Collect').first().json;
let reqs=[]; try{ reqs=$('Ark Requests').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('Ark Mobile Finder').all(); }catch(e){}
const st=state.stats; st.skips=st.skips||{};
const note=(k)=>{ st.skips[k]=(st.skips[k]||0)+1; };
const digits=(v)=>String(v||'').replace(/\D/g,'');
const plausible=(v)=>{ const d=digits(v); return d.length>=7&&d.length<=15; };
const isTollFree=(v)=>{ let x=digits(v); if(x.length===11&&x.charAt(0)==='1') x=x.slice(1); return x.length===10&&/^(?:800|833|844|855|866|877|888)/.test(x); };
answers.forEach((it,i)=>{
  const q=reqs[i]; if(!q) return;
  const r=state.rows[q.rowId]; if(!r||r.resolved) return;
  const j=it.json||{};
  st.arkCalls++;
  if(j.error&&j.statusCode===undefined&&j.status===undefined){
    const m=String((j.error&&(j.error.message||j.error.description))||j.error||'call failed');
    if(/credential/i.test(m)) note('AI-Ark: no credential on the node');
    else if(/credit|quota|payment|insufficient|balance/i.test(m)) note('AI-Ark: out of credits');
    else { r.error='ai-ark: '+m.slice(0,120); note('AI-Ark failed: '+m.slice(0,120)); }
    return;
  }
  let b=(j.body!==undefined)?j.body:j;
  if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b=null; } }
  if(!b||typeof b!=='object'){ r.error='ai-ark: unparseable response'; note('AI-Ark failed: unparseable response'); return; }
  const stt=Number(b.status||j.statusCode||0);
  if(stt===404) return; // clean miss
  if(stt!==200){
    const msg=(b.error&&(b.error.error||b.error.message))||('HTTP '+stt);
    if(stt===402||/credit|quota|payment|insufficient|balance/i.test(String(msg))) note('AI-Ark: out of credits');
    else { r.error='ai-ark: '+String(msg).slice(0,120); note('AI-Ark failed: '+String(msg).slice(0,120)); }
    return;
  }
  const nums=[];
  const flat=(x)=>{ if(!x) return; if(Array.isArray(x)){ x.forEach(flat); return; } if(typeof x==='string'&&plausible(x)) nums.push(x.trim()); };
  flat(b.data&&b.data.data);
  let hit='', tf='';
  for(const n of nums){ if(isTollFree(n)){ if(!tf) tf=n; } else { hit=n; break; } }
  if(hit){ r.resolved={ phone:hit, provider:'AI-Ark', type:'direct' }; st.arkFound++; }
  else if(tf&&!r.tf){ r.tf={ phone:tf, provider:'AI-Ark', type:'toll-free' }; }
});
for(const id of state.order){ const r=state.rows[id]; if(r.resolved) continue; if(!r.linkedin&&!(r.domain&&r.fullName)) note('AI-Ark: no LinkedIn URL and no domain plus name'); }
return [{ json:state }];
