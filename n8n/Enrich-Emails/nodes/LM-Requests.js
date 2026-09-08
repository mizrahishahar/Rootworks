// LM Requests: LeadMagic, the one paid finder, only for rows where everything else failed: not
// resolved, not on a catch-all domain, first and last name and domain present. Rare by
// construction, and only on the relevant people the view holds. {_none:true} when nothing to ask.
const state=$('MV Guess Collect').first().json;
const out=[];
for(const id of state.order){ const r=state.rows[id]; if(r.resolved||r.catchAll||r.lmAsked||!r.domain||!r.firstRaw||!r.lastRaw) continue; r.lmAsked=true; out.push({ json:{ rowId:id, body:{ first_name:r.firstRaw, last_name:r.lastRaw, domain:r.domain } } }); }
if(!out.length) return [{ json:{ _none:true } }];
return out;
