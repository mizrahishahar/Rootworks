// MV LM Collect: the MillionVerifier answers of MV LM (aligned by index to MV LM Requests) folded into the
// state from LM Collect. Per candidate: ok, catch_all, invalid, disposable, unknown, error. The first
// ok in candidate order resolves the row (Email Verified By MillionVerifier). One catch_all marks
// the domain for the whole batch: every other row there skips MillionVerifier from now on. A
// MillionVerifier out-of-credits answer stops the run here, loudly: nothing can be verified without
// it (the same law as the old waterfall). Never re-asks a candidate.
const state=$('LM Collect').first().json;
let reqs=[]; try{ reqs=$('MV LM Requests').all().map(i=>i.json||{}).filter(j=>!j._none); }catch(e){}
let answers=[]; try{ answers=$('MV LM').all(); }catch(e){}
const OK=['ok','catch_all','invalid','disposable','unknown'];
answers.forEach((it,i)=>{
  const q=reqs[i]; if(!q) return;
  const j=it.json||{};
  state.stats.mvCalls++;
  const r=state.rows[q.rowId]; if(!r) return;
  const c=r.candidates.find(x=>x.email===q.email&&!x.mv); if(!c) return;
  const dry=/insufficient credit|no credit|out of credit/i.test(String(j.error||''))||(Number.isFinite(Number(j.credits))&&Number(j.credits)<0);
  if(dry) throw new Error('MillionVerifier is out of credits (balance '+String(j.credits)+'). Nothing can be verified without it, so the run is stopping here. Top up and relaunch.');
  const res=OK.indexOf(j.result)>-1?j.result:'error';
  c.mv=res;
  if(res==='catch_all'){ r.catchAll=true; if(r.domain&&!state.domainCatchAll[r.domain]){ state.domainCatchAll[r.domain]=true; state.stats.catchAllDomains++; } for(const o of r.candidates){ if(!o.mv) o.mv='catch_all'; } }
});
for(const id of state.order){
  const r=state.rows[id]; if(r.resolved||r.catchAll) continue;
  const hit=r.candidates.find(x=>x.mv==='ok');
  if(hit) r.resolved={ email:hit.email, origin:hit.origin, by:'MillionVerifier' };
}
return [{ json:state }];
