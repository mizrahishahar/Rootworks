// Tier 2: AI-Ark mobile-phone-finder (v2, Clay-compatible: HTTP 200 on a miss), the same call as
// before. LinkedIn URL alone, else domain + full name. 5 credits a found number, nothing on a miss.
// Only people still without a direct number are asked.
const state=$('SQ Phone Collect').first().json;
const out=[];
for(const id of state.order){
  const r=state.rows[id];
  if(!r||r.resolved) continue;
  let body=null;
  if(r.linkedin) body={ linkedin:r.linkedin };
  else if(r.domain&&r.fullName) body={ domain:r.domain, name:r.fullName };
  if(!body) continue;
  out.push({ json:{ rowId:id, body } });
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
