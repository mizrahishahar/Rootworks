// Process Batch: Storeleads pages in, Companies rows out in the register's shape (List
// Building 2.0) plus the Storeleads declared extras. Nothing here reads the base: the column
// check, DNC, Clean Fields, Domain Source and Tag belong to the helper (Insert domains to
// Clayroots), which Split Rows hands the rows to. Employees is banded and accepts a number or a
// band string. public_emails_clean is left empty for Clean Fields to fill from Public Emails.
// The public-email waterfall lane is never written here: the waterfall creates and owns it.
// Growth 90d is declared on the table but not written: the pull carries no growth field.
// Inactive stores, empty domains and duplicate domains within the batch are counted and
// dropped as skips, never errors. The key list here is the one Preflight (the parent) names.
const inp = $('Batch Input').first().json;
const remaining = Math.max(0, Number(inp.remaining) || 0);
const pages = $input.all().map(i => i.json);
let errorPages = 0; let pulled = 0; let nextCursor = ''; let hasNext = false;
const raw = [];
for (const p of pages) {
  if (!p || !Array.isArray(p.domains)) { errorPages++; continue; }
  pulled += p.domains.length;
  raw.push(...p.domains);
  nextCursor = (p.next_cursor === undefined || p.next_cursor === null) ? nextCursor : String(p.next_cursor);
  hasNext = !!p.has_next_page;
}
const compact=(n)=>{ n=Number(n); if(!Number.isFinite(n)) return ''; const abs=Math.abs(n); if(abs>=1000000) return (n/1000000).toFixed(abs>=10000000?0:1).replace(/\.0$/,'')+'m'; if(abs>=1000) return (n/1000).toFixed(abs>=10000?0:1).replace(/\.0$/,'')+'k'; return String(Math.round(n)); };
const BANDS=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'];
const band=(v)=>{ const s=String(v==null?'':v).trim(); if(!s) return ''; if(BANDS.indexOf(s)>-1) return s; const n=Number(s.replace(/[,\s]/g,'')); if(!isFinite(n)||n<=0) return ''; if(n<=10) return '1-10'; if(n<=50) return '11-50'; if(n<=200) return '51-200'; if(n<=500) return '201-500'; if(n<=1000) return '501-1000'; if(n<=5000) return '1001-5000'; if(n<=10000) return '5001-10000'; return '10001+'; };
const SOC={instagram:'IG',tiktok:'TT',facebook:'FB',youtube:'YT',pinterest:'PIN',twitter:'X',x:'X',linkedin:'LI',snapchat:'SNAP'};
const MX=[[/google workspace|g ?suite|gmail|google apps/i,'Google'],[/microsoft 365|office 365|outlook|exchange online|microsoft exchange/i,'Microsoft'],[/zoho mail/i,'Zoho'],[/proton ?mail/i,'Proton'],[/godaddy (email|workspace)/i,'GoDaddy'],[/fastmail/i,'Fastmail'],[/yahoo mail/i,'Yahoo'],[/mimecast/i,'Mimecast'],[/proofpoint/i,'Proofpoint'],[/rackspace email/i,'Rackspace'],[/ionos mail/i,'IONOS']];
const mxFrom=(techs)=>{ for(const t of techs){ const n=String((t&&t.name)||''); if(!n) continue; for(const [re,label] of MX){ if(re.test(n)) return label; } } return ''; };
const emailsFrom=(ci)=>{const out=[];for(const c of (Array.isArray(ci)?ci:[])){if(!c||typeof c!=='object')continue;for(const k in c){const v=c[k];if(typeof v==='string'&&v.includes('@')&&!/\s/.test(v)){out.push(v.replace(/^mailto:/i,'').trim());}}}return out;};
const seen = new Set(); const out = []; let skipped = 0; let inactive = 0; let duplicate = 0;
for (const d of raw) {
  if (out.length >= remaining) break;
  const dom = String(d.tld1 || '').trim().toLowerCase();
  if (!dom) { skipped++; continue; }
  if (seen.has(dom)) { duplicate++; continue; }
  if (String(d.state || '') !== 'Active') { inactive++; continue; }
  seen.add(dom);
  const apps = Array.isArray(d.apps) ? d.apps : [];
  const techs = Array.isArray(d.technologies) ? d.technologies : [];
  const ci = Array.isArray(d.contact_info) ? d.contact_info : [];
  const tp = d.trustpilot || {};
  let ageY = null;
  if (d.created_at) { const c = new Date(d.created_at); if (!isNaN(c.getTime())) { ageY = Number(Math.max(0, (Date.now() - c.getTime()) / (365.25*24*3600*1000)).toFixed(1)); } }
  let migrated = '';
  if (d.last_platform) { let yr=''; if (d.last_platform_change_at) { const y=new Date(d.last_platform_change_at); if(!isNaN(y.getTime())) yr=String(y.getUTCFullYear()); } migrated = String(d.last_platform) + (yr?(' ('+yr+')'):''); }
  const socParts=[];
  for (const c of ci) { if (c && typeof c.followers==='number') { const lab=SOC[String(c.type||'').toLowerCase()]||String(c.type||'').toUpperCase().slice(0,3); if(lab) socParts.push(lab+' '+compact(c.followers)); } }
  const companyName = String((/^(www\.)?[a-z0-9.-]+\.[a-z]{2,}$/i.test(String(d.merchant_name||''))?d.title:d.merchant_name)||d.title||'').trim();
  const emails = Array.from(new Set(emailsFrom(ci).map(e=>e.toLowerCase().trim())));
  out.push({
    'Domain': dom,
    'Company': companyName,
    'Description': String(d.description||'').trim(),
    'Industry Groups': Array.isArray(d.categories) ? d.categories.filter(Boolean).map(String).join(', ') : '',
    'Employees': band(d.employee_count),
    'Country': String(d.country_code||'').trim(),
    'State': String(d.administrative_area_level_1||'').trim(),
    'City': String(d.city||'').trim(),
    'Public Emails': emails.join(', '),
    'public_emails_clean': '',
    'MX Provider': mxFrom(techs),
    'Plan': String(d.plan||'').trim(),
    'Revenue Est Monthly': (d.estimated_sales==null)?null:Math.round(Number(d.estimated_sales)/100),
    'Store Age Years': ageY,
    'Product Count': (d.product_count==null)?null:Number(d.product_count),
    'App Spend Mo': (d.monthly_app_spend==null)?null:Math.round(Number(d.monthly_app_spend)/100),
    'Key Apps': apps.map(a=>String((a&&a.name)||'').trim()).filter(Boolean).slice(0,5).join(', '),
    'Tech Stack': techs.map(t=>String((t&&t.name)||'').trim()).filter(Boolean).slice(0,5).join(', '),
    'Trustpilot Rating': (tp&&tp.avg_rating!=null)?Number(tp.avg_rating):null,
    'Trustpilot Reviews': (tp&&tp.review_count!=null)?Number(tp.review_count):null,
    'Migrated From': migrated,
    'Social Followers': socParts.slice(0,5).join(' / '),
    'Features': Array.isArray(d.features)?d.features.filter(Boolean).map(String).slice(0,5).join(', '):''
  });
}
return [{ json: { next_cursor: hasNext ? nextCursor : '', has_next_page: hasNext, pulled, kept: out.length, errorPages, skipped, inactive, duplicate, rows: out } }];
