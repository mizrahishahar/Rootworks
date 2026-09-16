// LM Requests: LeadMagic, the one paid finder, only for rows where nothing else is left: not
// resolved, first and last name and domain present, and either a normal domain where the provider
// address and every guess failed, or a catch-all domain whose Email was empty (a guess can never go
// to BounceBan; a finder's address can). A catch-all row that already holds a provider address is
// never asked: that address is what goes to BounceBan. {_none:true} when nothing to ask.
const state=$('MV Guess Collect').first().json;
const out=[];
for(const id of state.order){
  const r=state.rows[id];
  if(r.resolved||r.lmAsked||!r.domain||!r.firstRaw||!r.lastRaw) continue;
  if(r.catchAll&&r.candidates.some(c=>c.origin==='database')) continue;
  r.lmAsked=true;
  out.push({ json:{ rowId:id, body:{ first_name:r.firstRaw, last_name:r.lastRaw, domain:r.domain } } });
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
