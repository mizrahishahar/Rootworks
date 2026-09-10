// Plan Companies: the whole view's companies with the cap and floor each provider will honor,
// from the Employees value on OUR row (sources disagree on headcount), three coarse tiers:
//   up to 50 or unknown  cap 20  floor "wide" (everyone non-junior, senior ICs too)
//   51 to 500            cap 30  floor "nonjunior"
//   501 and up           cap 50  floor "manager" (manager and up)
// Supersoniq applies its own harder rule inside its lane (10, Director and up). Pull WIDE, cut in
// the base. Plus the DNC list read once for every lane's writer.
const pick=$('Pick Companies').first().json;
const BANDS=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'];
const band=(v)=>{ const s=String(v==null?'':v).trim(); if(!s) return ''; if(BANDS.indexOf(s)>-1) return s; const n=Number(s.replace(/[,\s+]/g,'')); if(!isFinite(n)||n<=0) return ''; if(n<=10) return '1-10'; if(n<=50) return '11-50'; if(n<=200) return '51-200'; if(n<=500) return '201-500'; if(n<=1000) return '501-1000'; if(n<=5000) return '1001-5000'; if(n<=10000) return '5001-10000'; return '10001+'; };
const tier=(b)=>{ if(!b||b==='1-10'||b==='11-50') return { cap:20, floor:'wide' }; if(b==='51-200'||b==='201-500') return { cap:30, floor:'nonjunior' }; return { cap:50, floor:'manager' }; };
const dnc=[]; try{ for(const it of $('Get DNC Domains').all()){ const j=it.json||{}; const f=j.fields||{}; const d=String(f.Domain||f.domain||'').toLowerCase().trim(); if(d) dnc.push(d); } }catch(e){}
const companies=(pick.companies||[]).map(c=>{ const b=band(c.employees); const t=tier(b); return { recordId:c.recordId, domain:c.domain, company:c.company, band:b||'unknown', cap:t.cap, floor:t.floor }; });
const tiers={ wide:0, nonjunior:0, manager:0 }; for(const c of companies) tiers[c.floor]++;
return [{ json:{ companies, tiers, dncDomains:Array.from(new Set(dnc)), companiesIn:companies.length } }];
