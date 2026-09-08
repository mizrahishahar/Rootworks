// Blitz Requests: one POST /v2/enrichment/email per unresolved row that carries a LinkedIn URL
// (the URL passed the name fence when the person landed). Blitz's email finder keys on the profile
// URL only; it is flat-rate, so it comes before any guess. Asked on catch-all rows too: there its
// answer is a candidate for BounceBan. {_none:true} when nothing to ask.
const state=$('MV Cand Collect').first().json;
const out=[];
for(const id of state.order){ const r=state.rows[id]; if(r.resolved||!r.linkedin||r.blitzAsked) continue; r.blitzAsked=true; out.push({ json:{ rowId:id, body:{ person_linkedin_url:r.linkedin } } }); }
if(!out.length) return [{ json:{ _none:true } }];
return out;
