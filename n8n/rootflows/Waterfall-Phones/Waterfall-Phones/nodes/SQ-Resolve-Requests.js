// Tier 1a: Supersoniq resolve, the same call the machine has always made
// (/partner/v1/companies/enrich, naked tier, has_phone filter, 5 contacts a company) and no other.
// One request per DISTINCT domain in the batch, never one per person: two people at the same company
// used to buy the identical answer twice. Up to 2.5 credits a domain (0.5 a naked contact).
// {_none:true} when there is nothing to ask. A Requests node only asks; the Collect after it owns
// the state and the counters.
const state=$('Prep').first().json;
const out=[];
for(const domain of Object.keys(state.domains||{})){
  const ids=(state.domains[domain]||[]).filter(id=>{ const r=state.rows[id]; return r&&!r.resolved&&(r.fullName||r.first); });
  if(!ids.length) continue;
  out.push({ json:{ domain, ids, body:{ companies:[{ domain }], tier:'naked', per_company_limit:5, filters:{ has_phone:true } } } });
}
if(!out.length) return [{ json:{ _none:true } }];
return out;
