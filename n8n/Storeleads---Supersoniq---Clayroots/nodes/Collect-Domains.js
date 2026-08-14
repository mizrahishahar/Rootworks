const cap = $('Build SL Query').first().json.maxCompanies;
const pages = $input.all().map(i => i.json);
const errs = []; const rows = [];
for (const p of pages) { if (!p || !Array.isArray(p.domains)) { errs.push(JSON.stringify(p).slice(0, 300)); continue; } rows.push(...p.domains); }
if (errs.length) { throw new Error('Storeleads pull returned an error page (' + errs.length + ' of ' + pages.length + '): ' + errs[0]); }
rows.sort((a, b) => { const ar = (a.rank === undefined || a.rank === null) ? Infinity : Number(a.rank); const br = (b.rank === undefined || b.rank === null) ? Infinity : Number(b.rank); return ar - br; });
const compact=(n)=>{ n=Number(n); if(!Number.isFinite(n)) return ''; const abs=Math.abs(n); if(abs>=1000000) return (n/1000000).toFixed(abs>=10000000?0:1).replace(/\.0$/,'')+'m'; if(abs>=1000) return (n/1000).toFixed(abs>=10000?0:1).replace(/\.0$/,'')+'k'; return String(Math.round(n)); };
const SOC={instagram:'IG',tiktok:'TT',facebook:'FB',youtube:'YT',pinterest:'PIN',twitter:'X',x:'X',linkedin:'LI',snapchat:'SNAP'};
const seen = new Set(); const companies = [];
for (const d of rows) {
  const dom = String(d.tld1 || '').trim().toLowerCase();
  if (!dom || seen.has(dom)) continue;
  if (String(d.state || '') !== 'Active') continue;
  seen.add(dom);
  const apps = Array.isArray(d.apps) ? d.apps : [];
  const techs = Array.isArray(d.technologies) ? d.technologies : [];
  const ci = Array.isArray(d.contact_info) ? d.contact_info : [];
  const tp = d.trustpilot || {};
  let ageY = null;
  if (d.created_at) { const c = new Date(d.created_at); if (!isNaN(c.getTime())) { ageY = Number(Math.max(0, (Date.now() - c.getTime()) / (365.25*24*3600*1000)).toFixed(1)); } }
  let migrated = '';
  if (d.last_platform) { let yr=''; if (d.last_platform_change_at) { const y=new Date(d.last_platform_change_at); if(!isNaN(y.getTime())) yr=String(y.getUTCFullYear()); } migrated = String(d.last_platform) + (yr?(' ('+yr+')'):''); }
  const socParts=[]; let growth=0;
  for (const c of ci) { if (c && typeof c.followers==='number') { const lab=SOC[String(c.type||'').toLowerCase()]||String(c.type||'').toUpperCase().slice(0,3); if(lab) socParts.push(lab+' '+compact(c.followers)); } if (c && typeof c.followers_90d==='number') { growth += c.followers_90d; } }
  companies.push({ Domain: dom, Company: String((/^(www\.)?[a-z0-9.-]+\.[a-z]{2,}$/i.test(String(d.merchant_name||''))?d.title:d.merchant_name)||d.title||'').trim(), Description: String(d.description || '').trim(), Employees: (d.employee_count === undefined || d.employee_count === null) ? '' : Number(d.employee_count), 'Industry Groups': Array.isArray(d.categories) ? d.categories.join(' | ') : '', City: String(d.city || '').trim(), State: String(d.administrative_area_level_1 || '').trim(), Country: String(d.country_code || '').trim(), rank: (d.rank === undefined || d.rank === null) ? null : Number(d.rank), estimated_sales: (d.estimated_sales === undefined || d.estimated_sales === null) ? null : Number(d.estimated_sales), Plan: String(d.plan || '').trim(), 'Revenue Est Monthly': (d.estimated_sales === undefined || d.estimated_sales === null) ? null : Math.round(Number(d.estimated_sales)/100), 'Store Age Years': ageY, 'Product Count': (d.product_count === undefined || d.product_count === null) ? null : Number(d.product_count), 'App Spend Mo': (d.monthly_app_spend === undefined || d.monthly_app_spend === null) ? null : Math.round(Number(d.monthly_app_spend)/100), 'Key Apps': apps.map(a=>String((a&&a.name)||'').trim()).filter(Boolean).slice(0,5).join(', '), 'Tech Stack': techs.map(t=>String((t&&t.name)||'').trim()).filter(Boolean).slice(0,5).join(', '), 'Trustpilot Rating': (tp && tp.avg_rating!=null) ? Number(tp.avg_rating) : null, 'Trustpilot Reviews': (tp && tp.review_count!=null) ? Number(tp.review_count) : null, 'Migrated From': migrated, 'Social Followers': socParts.slice(0,5).join(' / '), 'Growth 90d': growth, Features: Array.isArray(d.features) ? d.features.slice(0,5).join(', ') : '' });
  if (companies.length >= cap) break;
}
return [{ json: { _companies: companies, _domain_count: companies.length } }];