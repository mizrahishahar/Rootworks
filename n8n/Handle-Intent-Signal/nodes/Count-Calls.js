// Count Calls: one row per ICP-approved company with the two FREE count requests that answer
// "does this company already employ the role it is hiring for?". The role terms are the
// searches the Apify task ran (read from the run's INPUT), never typed anywhere else.
//   sq: Supersoniq POST /companies/match, filters.job_titles
//   cg_url: DiscoLike GET /contacts/count?domain=&title=...
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
let roles=[];
try{
  const j=$('Get Run Input').first().json||{};
  const b=parse(j.body===undefined?null:j.body)||{};
  const urls=[].concat(b.urls||[]).join(' ');
  const seen=new Set();
  for(const m of urls.matchAll(/keywords=([^&\s]+)/g)){ const k=decodeURIComponent(m[1].replace(/\+/g,' ')).trim(); if(k&&!seen.has(k.toLowerCase())){ seen.add(k.toLowerCase()); roles.push(k); } }
}catch(e){}
// A role title as a count term: "DevOps Engineer" -> "DevOps", "Site Reliability Engineer" -> "Site Reliability".
const terms=Array.from(new Set(roles.map(r=>r.replace(/\b(engineer|engineering|specialist|developer|lead|manager)\b/ig,'').replace(/\s+/g,' ').trim()).filter(Boolean)));
const out=[];
for(const it of $('Apply ICP').all()){
  const c=it.json||{}; if(!c.domain) continue;
  const q=['domain='+encodeURIComponent(c.domain)].concat(terms.map(t=>'title='+encodeURIComponent(t))).join('&');
  out.push({ json: { domain:c.domain, roles, terms,
    sq:{ companies:[{ domain:c.domain }], filters:{ job_titles: terms } },
    cg_url:'https://api.discolike.com/v1/contacts/count?'+q } });
}
if(!out.length) return [{ json: { _empty:true } }];
return out;
