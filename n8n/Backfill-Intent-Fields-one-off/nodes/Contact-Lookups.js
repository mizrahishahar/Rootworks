// Contact Lookups: one item per row that needs a DiscoLike /contacts/discover call, two modes.
//
// mode 'contact' (contacts pass): rows lacking Seniority; DiscoLike in domain mode with the
// name as filter, capped at 2; Build Writes accepts a result only when its LinkedIn URL matches
// the row's, never on name alone.
//
// mode 'liurl' (liurl pass, Operator ruling 2026-08-25): rows whose LinkedIn URL slug carries
// neither first nor last name (URL-decoded, diacritic-stripped compare). Same DiscoLike call;
// Build Writes matches the returned contact by exact normalised full name, keeps its URL only
// when it passes the same name guard, else blanks the row's URL (row becomes email-only).
const cfg=$('Parse Launch').first().json;
const rows=$('Fetch Rows').all().map(i=>i.json).filter(r=>r&&r.id);
const has=(f,k)=>{ const v=f[k]; return v!==undefined&&v!==null&&String(v).trim()!==''; };
const stripName=(s)=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const liSlug=(u)=>{ const m=String(u||'').match(/linkedin\.com\/in\/([^/?#]+)/i); if(!m) return null; let s=m[1]; try{ s=decodeURIComponent(s); }catch(e){} return stripName(s); };
const liMatch=(url,first,last)=>{ const slug=liSlug(url); if(slug===null||!slug) return null; const f=stripName(first), l=stripName(last); if(f.length<2&&l.length<2) return null; return (f.length>=2&&slug.includes(f))||(l.length>=2&&slug.includes(l)); };
const firstOf=(n)=>String(n||'').trim().split(/\s+/)[0]||'';
const lastOf=(n)=>{ const p=String(n||'').trim().split(/\s+/); return p.length>1?p.slice(1).join(' '):''; };
const out=[];
if(cfg.do.contacts){
  for(const r of rows){
    const f=r.fields||{};
    if(has(f,'Seniority')) continue;
    const li=String(f['LinkedIn URL']||'').trim(); const d=String(f['Domain']||'').toLowerCase().trim(); const name=String(f['Name']||'').trim();
    if(!li||!d||!name) continue;
    out.push({ json: { mode:'contact', id:r.id, domain:d, linkedin:li, name, cg:{ domain:[d], name, has_linkedin:true, max_companies:1, results_by_company:2 } } });
  }
}
if(cfg.do.liurl){
  for(const r of rows){
    const f=r.fields||{};
    const li=String(f['LinkedIn URL']||'').trim(); const d=String(f['Domain']||'').toLowerCase().trim(); const name=String(f['Name']||'').trim();
    if(!li||!d||!name) continue;
    if(liMatch(li, firstOf(name), lastOf(name))!==false) continue;                       // only mismatched URLs
    out.push({ json: { mode:'liurl', id:r.id, domain:d, linkedin:li, name, cg:{ domain:[d], name, has_linkedin:true, max_companies:1, results_by_company:3 } } });
  }
}
if(!out.length) return [{ json: { _empty:true, id:'', cg:{ domain:['none.invalid'], max_companies:1, results_by_company:1 } } }];
return out;
