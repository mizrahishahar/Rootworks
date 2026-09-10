// Tier 4, last: Prospeo enrich-person with enrich_mobile, the same call as before. 10 credits a
// mobile FOUND, nothing on NO_MATCH. Best identifier wins: email, else first + last + domain, else
// full name + domain, else the LinkedIn URL. Only people still without a direct number are asked.
const state=$('LM Collect').first().json;
const out=[];
for(const id of state.order){
  const r=state.rows[id];
  if(!r||r.resolved) continue;
  let data=null;
  if(r.email) data={ email:r.email };
  else if(r.firstRaw&&r.lastRaw&&r.domain) data={ first_name:r.firstRaw, last_name:r.lastRaw, company_website:r.domain };
  else if(r.fullName&&r.domain) data={ full_name:r.fullName, company_website:r.domain };
  else if(r.linkedin) data={ linkedin_url:r.linkedin };
  if(!data) continue;
  out.push({ json:{ rowId:id, body:{ data, enrich_mobile:true } } });
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
