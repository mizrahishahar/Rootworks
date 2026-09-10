// Tier 1b: Supersoniq phone unlock (/partner/v1/enrich/phone) by contact id, one request per person
// Supersoniq matched. THE PAID STEP: 10 credits a phone on file (25 specialty), nothing on a 404.
// Only people with no number yet reach here, so the batch's spend is exactly the matched people.
const state=$('SQ Resolve Collect').first().json;
const out=[];
for(const id of state.order){
  const r=state.rows[id];
  if(!r||r.resolved||!r.sqContactId) continue;
  out.push({ json:{ rowId:id, body:{ contact_id:r.sqContactId } } });
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
