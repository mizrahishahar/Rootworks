const cfg=$('Parse Config').first().json;
const cleanCompany=(nm)=>{if(!nm)return'';const orig=String(nm).trim();let c=orig.replace(/\s{2,}/g,' ');
const GEN=new Set(['home','welcome','shop','store','about','about us','products','index','page','contact','contact us','blog','news']);
const isGen=(s)=>GEN.has(String(s).trim().toLowerCase());
const TAGLINE_RE=/\b(free|shipping|sale|% ?off|buy now|shop now|official|welcome to|best|discover|explore|save up|subscribe|new arrivals|worldwide|delivery|since \d{4})\b/i;
const looksLikeTagline=(s)=>{const t=String(s||'').trim(); if(!t)return true; if(isGen(t))return true; if(TAGLINE_RE.test(t))return true; return t.split(/\s+/).filter(Boolean).length>=6;};
// Picks the more brand-like of two candidate segments. Falls back to the head (old default)
// unless one side is clearly a tagline or is at least 2 words shorter than the other.
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
// Never strip a legal-form suffix that's joined to the name by "&" (e.g. "Dose & Co", "Tiffany & Co.") - that IS the name.
for(let i=0;i<2;i++){const m=c.match(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i); if(!m)break; const before=c.slice(0,m.index).trim(); const lastWord=before.split(/\s+/).pop()||''; if(lastWord==='&')break; c=before;}
c=c.replace(/,+$/,'').trim();
const hasUp=/\p{Lu}/u.test(c), hasLow=/\p{Ll}/u.test(c);
if(hasUp!==hasLow){const parts=c.split(/(\s+)/); const words=parts.filter(t=>/\S/.test(t)); const MINOR=new Set(['of','and','the','for','to','in','on','at','by','a','an']);
if(!(hasUp&&words.length===1&&c.length<=4)){let wi=-1; c=parts.map(t=>{if(!/\S/.test(t))return t; wi++; const lw=t.toLowerCase(); return (wi>0&&MINOR.has(lw))?lw:lw.replace(/\p{L}/u,(ch)=>ch.toUpperCase());}).join('');}}
return c;};
const companies = {};
for (const i of $('Filter & Qualify Jobs').all()) { companies[i.json.domain] = i.json; }
const TARGET = cfg.campaign_url;
const nowIso = new Date().toISOString();
function pushContact(out, c) {
  const dom = String(c.company_domain || c.domain || '').toLowerCase();
  const co = companies[dom] || {};
  const li = c.linkedin_url || '';
  if (!li) return;
  const role = co.job_title || 'an infrastructure role';
  const posted = co.posted_at ? ' (posted ' + co.posted_at + ')' : '';
  out.push({ json: {
    'Name': c.full_name || ((c.first_name || '') + ' ' + (c.last_name || '')).trim(),
    'first_name': c.first_name || '',
    'last_name': c.last_name || '',
    'LinkedIn URL': li,
    'Domain': dom,
    'Company': cleanCompany(c.company_name || co.company || ''),
    'Email': c.email || '',
    'Event Type': cfg.event_type,
    'Target Campaign': TARGET,
    'Signal Detail': 'Hiring ' + role + posted + '. Decision maker (' + (c.job_title || c.seniority || '') + ') via Apify jobs scrape + Supersoniq. Job: ' + (co.job_link || ''),
    'Intent Status': 'NEW',
    'detected_at': nowIso
  }});
}
const out = [];
for (const it of $('Get Decision Makers').all()) {
  const resp = it.json || {};
  const comps = Array.isArray(resp.results) ? resp.results : [];
  for (const comp of comps) {
    if (Array.isArray(comp.contacts)) { for (const c of comp.contacts) pushContact(out, c); }
    else pushContact(out, comp);
  }
}
return out;