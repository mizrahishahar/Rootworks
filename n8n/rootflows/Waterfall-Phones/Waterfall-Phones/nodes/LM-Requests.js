// Tier 3: LeadMagic mobile-finder by work email, the same call as before. Only people still without
// a direct number and with an email are asked; LeadMagic charges per found mobile.
const state=$('Ark Collect').first().json;
const out=[];
for(const id of state.order){
  const r=state.rows[id];
  if(!r||r.resolved||!r.email) continue;
  out.push({ json:{ rowId:id, body:{ work_email:r.email } } });
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
