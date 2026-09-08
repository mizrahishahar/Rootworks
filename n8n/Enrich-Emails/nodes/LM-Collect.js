// LM Collect: LeadMagic's answers (aligned to LM Requests) become candidates with origin LeadMagic.
// Its negatives ("couldn't find", "unable to verify") and an out-of-credits answer are counted,
// never errors. The candidate is verified by the MV stage after.
const state=$('MV Guess Collect').first().json;
let reqs=[]; try{ reqs=$('LM Requests').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('LeadMagic Find').all(); }catch(e){}
state.stats.lmSkipped=state.stats.lmSkipped||'';
answers.forEach((it,i)=>{
  const q=reqs[i]; if(!q) return;
  const j=it.json||{};
  state.stats.lmCalls++;
  if(j.error&&typeof j.error==='object'&&j.email===undefined){ const m=String(j.error.message||j.error.description||''); if(/credential/i.test(m)) state.stats.lmSkipped='no credential on the LeadMagic node'; return; }
  const txt=JSON.stringify(j).toLowerCase();
  if(/insufficient_credits|insufficient credit|out of credits/.test(txt)){ state.stats.lmSkipped='out of credits'; return; }
  const e=String(j.email||'').trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return;
  const r=state.rows[q.rowId]; if(!r) return;
  if(r.candidates.some(c=>c.email===e)) return;
  r.candidates.push({ email:e, origin:'LeadMagic', mv:'' }); state.stats.lmFound++;
});
return [{ json:state }];
