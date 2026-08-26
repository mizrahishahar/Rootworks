// Ark Lookups (arkurl pass): one AI-Ark people-search body per target row.
// Scope 'blanked' = Supersoniq rows with no LinkedIn URL (restore the contacts the guard
// blanked, ruling 2026-08-25: LinkedIn matters more than email, nothing is given up).
// Scope 'all-supersoniq' = every Supersoniq row, standing URLs verified and replaced too.
// 0.5 credits per returned result, size 2 so ambiguity is visible.
const cfg=$('Parse Launch').first().json;
const rows=$('Fetch Rows').all().map(i=>i.json).filter(r=>r&&r.id);
const out=[];
if(cfg.do.arkurl){
  for(const r of rows){
    const f=r.fields||{};
    if(String(f['Contact Source']||'')!=='Supersoniq') continue;
    const li=String(f['LinkedIn URL']||'').trim();
    if(cfg.arkurl_scope==='blanked'&&li) continue;
    const name=String(f['Name']||'').trim(); const d=String(f['Domain']||'').toLowerCase().trim();
    if(!name||!d) continue;
    out.push({ json: { id:r.id, name, domain:d, linkedin:li, arkBody:{
      contact:{ fullName:{ any:{ include:{ mode:'SMART', content:[name] } } } },
      account:{ domain:{ any:{ include:[d] } } },
      page:0, size:2 } } });
  }
}
if(!out.length) return [{ json: { _empty:true, id:'', arkBody:{ contact:{ fullName:{ any:{ include:{ mode:'STRICT', content:['zzz-nobody-zzz'] } } } }, account:{ domain:{ any:{ include:['none.invalid'] } } }, page:0, size:1 } } }];
return out;
