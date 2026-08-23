// Domain Calls: one item per distinct domain that still needs company fields or the in-role
// count. Carries the BizData URL, the Supersoniq match body and the DiscoLike count URL.
// The role terms come from the Apify task's INPUT (keywords=), same as the live machine.
const cfg=$('Parse Launch').first().json;
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
let roles=[];
try{ const j=$('Get Run Input').first().json||{}; const b=parse(j.body===undefined?null:j.body)||{}; const urls=[].concat(b.urls||[]).join(' '); const seen=new Set();
  for(const m of urls.matchAll(/keywords=([^&\s]+)/g)){ const k=decodeURIComponent(m[1].replace(/\+/g,' ')).trim(); if(k&&!seen.has(k.toLowerCase())){ seen.add(k.toLowerCase()); roles.push(k); } } }catch(e){}
const terms=Array.from(new Set(roles.map(r=>r.replace(/\b(engineer|engineering|specialist|developer|lead|manager)\b/ig,'').replace(/\s+/g,' ').trim()).filter(Boolean)));
const rows=$('Fetch Rows').all().map(i=>i.json).filter(r=>r&&r.id);
const has=(f,k)=>{ const v=f[k]; return v!==undefined&&v!==null&&String(v).trim()!==''; };
const need={};
for(const r of rows){
  const f=r.fields||{}; const d=String(f['Domain']||'').toLowerCase().trim(); if(!d) continue;
  const n=need[d]||(need[d]={ company:false, role:false });
  if(cfg.do.company&&!has(f,'Description')&&!has(f,'Industry Groups')) n.company=true;
  if(cfg.do.role&&terms.length&&!has(f,'Existing In Role')) n.role=true;
}
const out=[];
for(const d of Object.keys(need)){
  const n=need[d]; if(!n.company&&!n.role) continue;
  const q=['domain='+encodeURIComponent(d)].concat(terms.map(t=>'title='+encodeURIComponent(t))).join('&');
  out.push({ json: { domain:d, want_company:n.company, want_role:n.role, roles, terms,
    biz_url: 'https://api.discolike.com/v1/bizdata?domain='+encodeURIComponent(d),
    sq: { companies:[{ domain:d }], filters:{ job_titles:terms } },
    cg_url: 'https://api.discolike.com/v1/contacts/count?'+q } });
}
if(!out.length) return [{ json: { _empty:true, domain:'', biz_url:'https://api.discolike.com/v1/bizdata?domain=none.invalid', cg_url:'https://api.discolike.com/v1/contacts/count?domain=none.invalid', sq:{ companies:[{ domain:'none.invalid' }] } } }];
return out;
