// Contact Lookups: one item per row that still lacks contact fields (Seniority) and carries a
// LinkedIn URL, Name and Domain. DiscoLike /contacts/discover in domain mode with the name as
// filter, capped at 2 results; Build Writes accepts a result only when its LinkedIn URL matches
// the row's, never on name alone.
const cfg=$('Parse Launch').first().json;
const rows=$('Fetch Rows').all().map(i=>i.json).filter(r=>r&&r.id);
const has=(f,k)=>{ const v=f[k]; return v!==undefined&&v!==null&&String(v).trim()!==''; };
const out=[];
if(cfg.do.contacts){
  for(const r of rows){
    const f=r.fields||{};
    if(has(f,'Seniority')) continue;
    const li=String(f['LinkedIn URL']||'').trim(); const d=String(f['Domain']||'').toLowerCase().trim(); const name=String(f['Name']||'').trim();
    if(!li||!d||!name) continue;
    out.push({ json: { id:r.id, domain:d, linkedin:li, name, cg:{ domain:[d], name, has_linkedin:true, max_companies:1, results_by_company:2 } } });
  }
}
if(!out.length) return [{ json: { _empty:true, id:'', cg:{ domain:['none.invalid'], max_companies:1, results_by_company:1 } } }];
return out;
