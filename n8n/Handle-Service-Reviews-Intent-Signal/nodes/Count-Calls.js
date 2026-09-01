// Count Calls: one row per ICP-approved company with the FREE count request that answers
// "does this company already employ the support roles on the Signals row?". The role terms are
// the Signals row's `Roles` line, nothing else. Reused verbatim from Handle Hiring Intent
// Signal; only the question's meaning shifts (existing support headcount, never a gate).
const cfg=$('Parse Play').first().json;
const terms=Array.isArray(cfg.roles)?cfg.roles:[];
const out=[];
for(const it of $('Apply ICP').all()){
  const c=it.json||{}; if(!c.domain) continue;
  const q=['domain='+encodeURIComponent(c.domain)].concat(terms.map(t=>'title='+encodeURIComponent(t))).join('&');
  out.push({ json: { domain:c.domain, terms,
    cg_url:'https://api.discolike.com/v1/contacts/count?'+q } });
}
if(!out.length) return [{ json: { _empty:true } }];
return out;
