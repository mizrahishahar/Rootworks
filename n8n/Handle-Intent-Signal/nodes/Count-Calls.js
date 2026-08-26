// Count Calls: one row per ICP-approved company with the FREE count request that answers
// "does this company already employ the role it is hiring for?". The role terms are the play's
// `roles` line, nothing else. (Supersoniq's match count left with Supersoniq, ruling 2026-08-26.)
//   cg_url: DiscoLike GET /contacts/count?domain=&title=...
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
