const inp = $('Batch Input').first().json;
const remaining = Math.max(0, Number(inp.remaining) || 0);
const runId = String(inp.runId || '');
const tag = String(inp.tag || '').trim();
const buildDate = String(inp.submittedAt || '').slice(0,10) || new Date().toISOString().slice(0,10);
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
const band=(n)=>{ n=Number(n); if(!Number.isFinite(n)||n<=0) return ''; if(n<=10) return '1-10'; if(n<=50) return '11-50'; if(n<=200) return '51-200'; if(n<=500) return '201-500'; if(n<=1000) return '501-1000'; if(n<=5000) return '1001-5000'; if(n<=10000) return '5001-10000'; return '10001+'; };
const SOC={instagram:'IG',tiktok:'TT',facebook:'FB',youtube:'YT',pinterest:'PIN',twitter:'X',x:'X',linkedin:'LI',snapchat:'SNAP'};
const cleanCompany=(nm)=>{if(!nm)return'';const orig=String(nm).trim();let c=orig;
const GEN=new Set(['home','welcome','shop','store','about','about us','products','index','page','contact','contact us','blog','news']);
const isGen=(s)=>GEN.has(String(s).trim().toLowerCase());
const pick=(a)=>{for(const p of a){if(p&&String(p).trim()&&!isGen(p))return String(p).trim();}return null;};
c=c.replace(/^welcome to\s+/i,'').trim();
const pp=c.split(' | '); if(pp.length>1){const s=pick(pp); if(s===null) return orig; c=s;}
for(let i=0;i<2;i++){const d=c.search(/\s[-–—]\s/); if(d<3) break; const head=c.slice(0,d).trim(); const tail=c.slice(d).replace(/^\s[-–—]\s/,'').trim(); const s=pick([head,tail]); if(s===null) return orig; c=s;}
if(/^[A-Za-z0-9][A-Za-z0-9-]*(\.[A-Za-z]{2,})+$/.test(c)) c=c.replace(/(\.[A-Za-z]{2,})+$/,'');
c=c.replace(/[®™]/g,'');
for(let i=0;i<2;i++){c=c.replace(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i,'').trim();}
c=c.replace(/,+$/,'').trim();
const hasUp=/\p{Lu}/u.test(c), hasLow=/\p{Ll}/u.test(c);
if(hasUp!==hasLow){const parts=c.split(/(\s+)/); const words=parts.filter(t=>/\S/.test(t)); const MINOR=new Set(['of','and','the','for','to','in','on','at','by','a','an']);
if(!(hasUp&&words.length===1&&c.length<=4)){let wi=-1; c=parts.map(t=>{if(!/\S/.test(t))return t; wi++; const lw=t.toLowerCase(); return (wi>0&&MINOR.has(lw))?lw:lw.replace(/\p{L}/u,(ch)=>ch.toUpperCase());}).join('');}}
return c;};
const BLACK=new Set(['hr','careers','career','jobs','job','legal','privacy','noreply','no-reply','donotreply','abuse','postmaster','compliance','recruiting','recruitment','press','media','unsubscribe','webmaster','admin','info-security']);
const emailsFrom=(ci)=>{const out=[];for(const c of (Array.isArray(ci)?ci:[])){if(!c||typeof c!=='object')continue;for(const k in c){const v=c[k];if(typeof v==='string'&&v.includes('@')&&!/\s/.test(v)){out.push(v.replace(/^mailto:/i,'').trim());}}}return out;};
const keepPublic=(arr)=>arr.filter(e=>{const lp=e.split('@')[0].toLowerCase().split('+')[0];return !BLACK.has(lp);});
const seen = new Set(); const out = []; let withEmails = 0; let skipped = 0;
for (const d of raw) {
  if (out.length >= remaining) break;
  const dom = String(d.tld1 || '').trim().toLowerCase();
  if (!dom) { skipped++; continue; }
  if (seen.has(dom)) continue;
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
  const socParts=[];
  for (const c of ci) { if (c && typeof c.followers==='number') { const lab=SOC[String(c.type||'').toLowerCase()]||String(c.type||'').toUpperCase().slice(0,3); if(lab) socParts.push(lab+' '+compact(c.followers)); } }
  const companyName = String((/^(www\.)?[a-z0-9.-]+\.[a-z]{2,}$/i.test(String(d.merchant_name||''))?d.title:d.merchant_name)||d.title||'').trim();
  const emails = Array.from(new Set(keepPublic(emailsFrom(ci)).map(e=>e.toLowerCase().trim())));
  if (emails.length) withEmails++;
  out.push({
    Domain: dom, Company: cleanCompany(companyName), company_clean: cleanCompany(companyName),
    public_emails_clean: emails.length?emails.join(', '):'',
    'Industry Groups': Array.isArray(d.categories) ? d.categories.join(' | ') : '',
    Employees: band(d.employee_count),
    City: String(d.city||'').trim(), State: String(d.administrative_area_level_1||'').trim(), Country: String(d.country_code||'').trim(),
    Description: String(d.description||'').trim(), Plan: String(d.plan||'').trim(),
    'Revenue Est Monthly': (d.estimated_sales==null)?null:Math.round(Number(d.estimated_sales)/100),
    'Store Age Years': ageY,
    'Product Count': (d.product_count==null)?null:Number(d.product_count),
    'App Spend Mo': (d.monthly_app_spend==null)?null:Math.round(Number(d.monthly_app_spend)/100),
    'Key Apps': apps.map(a=>String((a&&a.name)||'').trim()).filter(Boolean).slice(0,5).join(', '),
    'Tech Stack': techs.map(t=>String((t&&t.name)||'').trim()).filter(Boolean).slice(0,5).join(', '),
    'Trustpilot Rating': (tp&&tp.avg_rating!=null)?Number(tp.avg_rating):null,
    'Trustpilot Reviews': (tp&&tp.review_count!=null)?Number(tp.review_count):null,
    'Migrated From': migrated, 'Social Followers': socParts.slice(0,5).join(' / '),
    Features: Array.isArray(d.features)?d.features.slice(0,5).join(', '):'',
    segment: emails.length?'has_public':'no_public', Source: 'Storeleads', Tag: tag
  });
}
return [{ json: { next_cursor: hasNext ? nextCursor : '', has_next_page: hasNext, pulled, inserted: out.length, withEmails, errorPages, skipped, rows: out } }];