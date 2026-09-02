// Format Companies: one DiscoLike discover profile in, one Companies row out, in the
// register's shape. Employees accepts both a band ("51-200") and a number. Rows with no domain
// are counted and dropped; duplicate domains within the pull collapse to one. Nothing here
// reads the base: the column check, the open-field rule, DNC, Clean Fields, Domain Source and
// Tag belong to the helper (Insert domains to Clayroots), which gets its contract as _meta on
// the first row. _stats rides on the first row for the log; the helper strips every "_" key.
const p=$('Launch Params').first().json;
const BANDS=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'];
const band=(v)=>{ const s=String(v==null?'':v).trim(); if(!s) return ''; if(BANDS.indexOf(s)>-1) return s; const n=Number(s.replace(/[,\s]/g,'')); if(!isFinite(n)||n<=0) return ''; if(n<=10) return '1-10'; if(n<=50) return '11-50'; if(n<=200) return '51-200'; if(n<=500) return '201-500'; if(n<=1000) return '501-1000'; if(n<=5000) return '1001-5000'; if(n<=10000) return '5001-10000'; return '10001+'; };
const join=(a)=>Array.isArray(a)?a.filter(Boolean).map(String).join(', '):(a==null?'':String(a));
const kv=(o)=>o&&typeof o==='object'&&!Array.isArray(o)?Object.entries(o).map(([k,v])=>k+':'+(typeof v==='number'?v.toFixed(2):v)).join(', '):join(o);
const keys=(o)=>o&&typeof o==='object'&&!Array.isArray(o)?Object.keys(o).join(', '):join(o);
const norm=(d)=>String(d||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').replace(/\/.*$/,'');
const seen=new Set(); const out=[]; const stats={ pulled:0, no_domain:0, duplicate:0 };
for(const it of $input.all()){
  const c=it.json||{}; if(!Object.keys(c).length) continue; stats.pulled++;
  const d=norm(c.domain); if(!d){ stats.no_domain++; continue; }
  if(seen.has(d)){ stats.duplicate++; continue; } seen.add(d);
  const addr=c.address||{};
  out.push({ json: {
    'Domain': d,
    'Company': String(c.name||'').trim(),
    'Description': String(c.description||''),
    'Industry Groups': kv(c.industry_groups),
    'Business Model': kv(c.business_model),
    'Employees': band(c.employees),
    'Revenue Range': String(c.revenue_range||''),
    'Keywords': keys(c.keywords),
    'Country': String(addr.country||''), 'State': String(addr.state||''), 'City': String(addr.city||''),
    'Street': String(addr.street||''), 'Zip': String(addr.zip||''),
    'Phones': join(c.phones), 'Public Emails': join(c.public_emails), 'public_emails_clean': '',
    'Social URLs': join(c.social_urls),
    'MX Provider': String(c.mx_provider||''), 'Redirect Domain': String(c.redirect_domain||'')
  } });
}
if(!out.length) return [{ json: { _empty:true, _stats:stats } }];
out[0].json._stats=stats;
out[0].json._meta={ base:p.base, clientRecId:p.clientRecId, tag:p.tag||'', domainSource:'DiscoLike', allowNew:true };
return out;
