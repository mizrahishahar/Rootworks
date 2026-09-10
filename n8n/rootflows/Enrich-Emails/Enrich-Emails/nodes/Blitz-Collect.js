// Blitz Collect: the finder's answers (aligned to Blitz Requests) become candidates with origin
// Blitz: the top email, plus every all_emails entry for the current job (job_order_in_profile 1)
// at the row's domain. A missing credential or a dead API is counted and the stage is skipped for
// this batch, never an error that stops the run. The candidates are verified by the MV stage after.
const state=$('MV Cand Collect').first().json;
let reqs=[]; try{ reqs=$('Blitz Requests').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('Blitz Email').all(); }catch(e){}
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
state.stats.blitzSkipped=state.stats.blitzSkipped||'';
answers.forEach((it,i)=>{
  const q=reqs[i]; if(!q) return;
  const j=it.json||{};
  state.stats.blitzCalls++;
  if(j.error&&j.body===undefined&&j.found===undefined){ const m=errMsg(j.error); if(/credential/i.test(m)) state.stats.blitzSkipped='no credential on the Blitz node'; else state.stats.blitzSkipped=m.slice(0,120); return; }
  const b=(j.body!==undefined)?j.body:j;
  if(!b||typeof b!=='object'||!b.found) return;
  const r=state.rows[q.rowId]; if(!r) return;
  const list=[]; if(b.email) list.push(String(b.email).toLowerCase());
  for(const e of (Array.isArray(b.all_emails)?b.all_emails:[])){ if(e&&e.email&&Number(e.job_order_in_profile)===1) list.push(String(e.email).toLowerCase()); }
  let added=0;
  for(const e of list){ if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) continue; if(r.candidates.some(c=>c.email===e)) continue; r.candidates.push({ email:e, origin:'Blitz', mv:'' }); added++; }
  if(added) state.stats.blitzFound++;
});
return [{ json:state }];
