const items = $input.all().map(i => i.json);
const mapItem = items.find(x => x && x.map);
const map = (mapItem && mapItem.map) || {};
const rows = items.filter(x => x !== mapItem);
const form = $('Contacts Launch').first().json;
const runId = String($execution.id);
const tag = ((form['Tag'] || '') + '').trim();

const stripDomain = (url) => { let d = String(url||'').trim().toLowerCase(); if(!d) return ''; d = d.replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0].split('?')[0]; return d; };

// Decision-maker-tier seniority values, matching the enum used elsewhere in this stack.
const SEN = { c_suite:'C-Suite', vp:'VP', director:'Director', manager:'Manager', senior:'Senior', owner:'Owner', founder:'Founder', head:'Head', partner:'Partner', 'mid-level':'Unclassified', entry:'Unclassified', intern:'Unclassified' };
const mapSeniority = (v) => SEN[String(v||'').trim().toLowerCase()] || 'Unclassified';

// Same company-name cleanup as the Storeleads/Supersoniq pipeline's Format Supersoniq node -
// strips taglines, "Welcome to", legal suffixes, normalizes casing. Applied whether the name
// came from the Domains table match or the AI-Ark CSV fallback.
const cap=(s)=>s?s.charAt(0).toUpperCase()+s.slice(1).toLowerCase():'';
const cleanCompany=(nm)=>{if(!nm)return'';const orig=String(nm).trim();let c=orig.replace(/\s{2,}/g,' ');
const GEN=new Set(['home','welcome','shop','store','about','about us','products','index','page','contact','contact us','blog','news']);
const isGen=(s)=>GEN.has(String(s).trim().toLowerCase());
const TAGLINE_RE=/\b(free|shipping|sale|% ?off|buy now|shop now|official|welcome to|best|discover|explore|save up|subscribe|new arrivals|worldwide|delivery|since \d{4})\b/i;
const looksLikeTagline=(s)=>{const t=String(s||'').trim(); if(!t)return true; if(isGen(t))return true; if(TAGLINE_RE.test(t))return true; return t.split(/\s+/).filter(Boolean).length>=6;};
const pickPair=(head,tail)=>{const h=String(head||'').trim(),t=String(tail||'').trim();
  const hTag=looksLikeTagline(h),tTag=looksLikeTagline(t);
  if(hTag&&tTag)return null;
  if(hTag)return t||null; if(tTag)return h||null;
  if(!h)return t||null; if(!t)return h||null;
  const hw=h.split(/\s+/).length,tw=t.split(/\s+/).length;
  if(Math.abs(hw-tw)<=1)return h;
  return hw<tw?h:t;};
c=c.replace(/^welcome to\s+/i,'').trim();
const pp=c.split(' | ');
if(pp.length>1){
  const cands=pp.map(s=>s.trim()).filter(Boolean);
  const clean=cands.filter(s=>!looksLikeTagline(s));
  if(clean.length===1){c=clean[0];}
  else if(clean.length>1){clean.sort((a,b)=>a.split(/\s+/).length-b.split(/\s+/).length); c=clean[0];}
  else{return orig;}
}
for(let i=0;i<2;i++){const d=c.search(/\s[-–—:]\s/); if(d<3) break; const head=c.slice(0,d).trim(); const tail=c.slice(d).replace(/^\s[-–—:]\s/,'').trim(); const s=pickPair(head,tail); if(s===null) return orig; c=s;}
if(/^[A-Za-z0-9][A-Za-z0-9-]*(\.[A-Za-z]{2,})+$/.test(c)) c=c.replace(/(\.[A-Za-z]{2,})+$/,'');
c=c.replace(/[®™]/g,'');
for(let i=0;i<2;i++){const m=c.match(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i); if(!m)break; const before=c.slice(0,m.index).trim(); const lastWord=before.split(/\s+/).pop()||''; if(lastWord==='&')break; c=before;}
c=c.replace(/,+$/,'').trim();
const hasUp=/\p{Lu}/u.test(c), hasLow=/\p{Ll}/u.test(c);
if(hasUp!==hasLow){const parts=c.split(/(\s+)/); const words=parts.filter(t=>/\S/.test(t)); const MINOR=new Set(['of','and','the','for','to','in','on','at','by','a','an']);
if(!(hasUp&&words.length===1&&c.length<=4)){let wi=-1; c=parts.map(t=>{if(!/\S/.test(t))return t; wi++; const lw=t.toLowerCase(); return (wi>0&&MINOR.has(lw))?lw:lw.replace(/\p{L}/u,(ch)=>ch.toUpperCase());}).join('');}}
return c;};

// Pipeline/bookkeeping fields to never carry through from the Domains table onto a contact -
// same exclusion list as the Storeleads/Supersoniq pipeline's Format Supersoniq node.
const DOMAIN_SKIP = new Set(['domain','company_domain','Verified','segment','query_name','ingested_at','RankInCompany','Run ID','Build Date','Tag','public_emails_clean','Created','Contact Source','Source']);

let skipped = 0;
let matched = 0;
const out = [];
for (const r of rows) {
  const first = String(r['First Name']||'').trim();
  const last = String(r['Last Name']||'').trim();
  const domain = stripDomain(r['Company Website']);
  const key = (first.toLowerCase()+last.toLowerCase()+domain).trim();
  if (!key) { skipped++; continue; }
  const dm = map[domain] || null;
  if (dm) matched++;
  // No match in the Domains table: fall back to AI-Ark's own company name only, nothing else guessed.
  const rawCompany = dm ? (dm.Company || dm.company_clean || '') : String(r['Company Name for Emails']||r['Company Name']||'').trim();
  const company = cleanCompany(rawCompany);

  const dmClean = {};
  if (dm) { for (const k of Object.keys(dm)) { if (DOMAIN_SKIP.has(k)) continue; dmClean[k] = dm[k]; } }

  out.push({ json: {
    ...dmClean,
    'Contact Key': key,
    Name: r['Full Name'] || (first+' '+last).trim(), first_name: first, last_name: last,
    Title: String(r['Title']||''), Seniority: mapSeniority(r['Seniority']),
    Email: String(r['Email Business']||'').trim(), Social: String(r['LinkedIn']||'').trim(), Phone: String(r['Mobile Phone']||'').trim(),
    Domain: domain, Company: company,
    'Contact Source': 'AI Ark', Tag: tag, 'Run ID': runId
  }});
}
const sd = $getWorkflowStaticData('global');
sd.aiArkSkipped = skipped;
sd.aiArkMatched = matched;
if (!out.length) { throw new Error('No usable AI-Ark contacts after formatting. Rows skipped for an empty Contact Key: '+skipped+'.'); }
return out;