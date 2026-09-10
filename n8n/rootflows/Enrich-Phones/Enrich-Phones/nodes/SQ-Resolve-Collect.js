// Tier 1a collected: the resolve answers, aligned to SQ Resolve Requests, matched to our people by
// name. A person Supersoniq does not know is a clean miss and the next tier gets its try; a refused
// or unparseable call is a failure named on the run row, never a negative; a missing credential or
// an empty wallet is a SKIP named on the run row, never a crash.
const state=$('Prep').first().json;
let reqs=[]; try{ reqs=$('SQ Resolve Requests').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('SQ Company Resolve').all(); }catch(e){}
const st=state.stats; st.skips=st.skips||{};
const note=(k)=>{ st.skips[k]=(st.skips[k]||0)+1; };
const norm=(v)=>String(v||'').toLowerCase().replace(/[^a-z]/g,'');
answers.forEach((it,i)=>{
  const q=reqs[i]; if(!q) return;
  const j=it.json||{};
  st.sqResolveCalls++;
  if(j.error&&j.statusCode===undefined){
    const m=String((j.error&&(j.error.message||j.error.description))||j.error||'call failed');
    if(/credential/i.test(m)) note('Supersoniq: no credential on the node');
    else if(/credit|quota|payment|insufficient|balance/i.test(m)) note('Supersoniq: out of credits');
    else note('Supersoniq resolve failed: '+m.slice(0,120));
    return;
  }
  let b=(j.body!==undefined)?j.body:j;
  if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b=null; } }
  const code=Number(j.statusCode||0);
  if(!b||typeof b!=='object'||code>=400){
    const msg=(b&&((b.detail&&JSON.stringify(b.detail).slice(0,150))||b.error||b.message))||('HTTP '+(code||'?'));
    if(code===402||/credit|quota|payment|insufficient|balance/i.test(String(msg))) note('Supersoniq: out of credits');
    else note('Supersoniq resolve failed: '+String(msg).slice(0,120));
    return;
  }
  const contacts=[];
  const walk=(x)=>{ if(!x) return; if(Array.isArray(x)){ x.forEach(walk); return; } if(typeof x==='object'){ if(Array.isArray(x.contacts)) contacts.push(...x.contacts); for(const v of Object.values(x)){ if(v&&typeof v==='object') walk(v); } } };
  walk(b);
  for(const id of (q.ids||[])){
    const r=state.rows[id]; if(!r||r.resolved||r.sqContactId) continue;
    const wantF=norm(r.firstRaw), wantL=norm(r.lastRaw), wantFull=norm(r.fullName)||(wantF+wantL);
    let match=null;
    for(const ct of contacts){
      const cf=norm(ct.first_name), cl=norm(ct.last_name);
      const full=norm(ct.full_name)||(cf+cl);
      if(wantF&&wantL&&cf===wantF&&cl===wantL){ match=ct; break; }
      if(wantFull&&full&&full===wantFull){ match=ct; break; }
    }
    if(!match&&contacts.length===1&&wantF&&norm(contacts[0].first_name)===wantF) match=contacts[0];
    const cid=match&&(match.contact_id||match.id||match.uuid);
    if(cid){ r.sqContactId=String(cid); st.sqMatched++; }
  }
});
for(const id of state.order){ const r=state.rows[id]; if(r.resolved) continue; if(!r.domain||!(r.fullName||r.first)) note('Supersoniq: missing domain or name'); }
return [{ json:state }];
