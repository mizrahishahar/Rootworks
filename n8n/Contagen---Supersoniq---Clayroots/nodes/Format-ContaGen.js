const titleCase=(s)=>String(s).replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst=(f)=>{if(!f)return'';let n=String(f).split(',')[0].trim().split(/\s+/)[0]||'';n=n.replace(/[^A-Za-z\-']/g,'');return n?n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():'';};
const cleanLast=(f)=>{if(!f)return'';let p=String(f).split(',')[0].trim().split(/\s+/);if(p.length<2)return'';return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim());};
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
const ST={AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia',PR:'Puerto Rico',ON:'Ontario',QC:'Quebec',BC:'British Columbia',AB:'Alberta',MB:'Manitoba',SK:'Saskatchewan',NS:'Nova Scotia',NB:'New Brunswick'};
const FULL=new Set(Object.values(ST).map(v=>v.toLowerCase()));
const stateFull=(raw)=>{if(raw==null)return'';let s=String(raw).trim();if(!s)return'';let u=s.toUpperCase().replace(/\./g,'');if(ST[u])return ST[u];if(FULL.has(s.toLowerCase()))return titleCase(s);return s;};

const rows=$('Read CSV').all().map(i=>i.json);

const RESERVED=new Set(['Name','Domain','domain','company_domain','Email','Verified','Company','State','first_name','last_name','company_clean','State Full','segment','query_name','ingested_at','Run ID','RankInCompany','Contact Source','Build Date','Tag']);
const ROW_ONLY=new Set(['Title','Seniority','Department','Social','Phone','Connections','Similarity']);
const COMPANY_COLS=['Business Model','MX Provider'];

const cmap={};
for(const r of rows){
  const d=String(r.Domain||r.domain||r.company_domain||'').trim().toLowerCase();
  if(!d) continue;
  const c=cmap[d]||(cmap[d]={});
  for(const k of Object.keys(r)){
    if(RESERVED.has(k)||ROW_ONLY.has(k)) continue;
    const v=r[k];
    if((c[k]===undefined||c[k]==='') && v!==undefined && String(v).trim()!=='') c[k]=String(v).trim();
  }
  for(const k of COMPANY_COLS){ if(c[k]===undefined) c[k]=''; }
}

const runId=String($execution.id);
const tag=((($('Waterfall Upload').first().json['Tag'])||'')+'').trim();
const _st=($('Config').first().json||{}).startedAt;
let buildDate='';
try{ buildDate=DateTime.fromISO(String(_st)).toFormat('yyyy-MM-dd'); }catch(e){ buildDate=''; }
if(!buildDate||buildDate==='Invalid DateTime'){ buildDate=$now.toFormat('yyyy-MM-dd'); }
let skipped=0;
const out=[];
for(const r of rows){
  const name=String(r.Name||'').trim();
  const domain=String(r.Domain||r.domain||'').trim().toLowerCase();
  const first=cleanFirst(name);
  const last=cleanLast(name);
  const key=(first.toLowerCase().trim()+last.toLowerCase().trim()+domain).trim();
  if(!key){ skipped++; continue; }
  if(!name) continue;
  const co=cmap[domain]||{};

  const passthrough={};
  for(const k of Object.keys(r)){
    if(RESERVED.has(k)) continue;
    const v=r[k];
    passthrough[k]=(v===undefined||v===null)?'':String(v).trim();
  }
  for(const k of Object.keys(co)){
    if(co[k]!==undefined && co[k]!=='') passthrough[k]=co[k];
  }

  out.push({json:{
    ...passthrough,
    'Contact Key':key,
    Name:name,
    first_name:first,
    last_name:last,
    Domain:domain,
    Company:cleanCompany(co.Company||String(r.Company||'').trim()),
    company_clean:cleanCompany(co.Company||r.Company),
    State:co.State||String(r.State||'').trim(),
    'State Full':stateFull(co.State||r.State||''),
    'Business Model':co['Business Model']||'',
    'MX Provider':co['MX Provider']||'',
    Email:String(r.Email||'').trim(),
    'Run ID':runId,
    'Build Date':buildDate,
    'Tag':tag,
    'Contact Source':'ContaGen'
  }});
}
const sd=$getWorkflowStaticData('global');
sd.wfSkips=sd.wfSkips||{cg:0,sq:0};
sd.wfSkips.cg=skipped;
return out;