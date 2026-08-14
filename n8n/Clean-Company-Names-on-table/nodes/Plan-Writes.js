const cfg = $('Detect Company Columns').first().json;
const s = $getWorkflowStaticData('global');
s.ccn = s.ccn || {};
if (!s.ccn[$execution.id]) { s.ccn[$execution.id] = { scanned: 0, changed: 0, unchanged: 0, blank: 0, quarantined: 0, pipe: 0, dash: 0, legal: 0, symbol: 0, pages: 0, batches: 0 }; }
const st = s.ccn[$execution.id];

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

const classify = (nm) => {
  const t = { pipe: false, dash: false, symbol: false, legal: false };
  let c = String(nm).trim();
  const p = c.indexOf(' | ');
  if (p > -1) { t.pipe = true; c = c.slice(0, p).trim(); }
  const d = c.search(/\s[-–—]\s/);
  if (d >= 3) { t.dash = true; c = c.slice(0, d).trim(); }
  if (/[®™]/.test(c)) { t.symbol = true; c = c.replace(/[®™]/g, ''); }
  for (let i = 0; i < 2; i++) {
    const n = c.replace(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i, '').trim();
    if (n !== c) { t.legal = true; }
    c = n;
  }
  return t;
};

const GENERIC = ['home','shop','welcome','about','products','store','index','page','contact'];
const readVal = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') { return typeof v.value === 'string' ? v.value : ''; }
  return String(v);
};

const resp = $input.first().json || {};
const records = Array.isArray(resp.records) ? resp.records : [];
const updates = [];
for (const rec of records) {
  const f = (rec && rec.fields) || {};
  st.scanned++;
  const companyRaw = readVal(f[cfg.companyField]);
  const cleanRaw = cfg.cleanField ? readVal(f[cfg.cleanField]) : '';
  const source = companyRaw.trim() ? companyRaw : cleanRaw;
  if (!String(source).trim()) { st.blank++; continue; }
  const value = cleanCompany(source);
  if (!value || value.length < 3 || GENERIC.indexOf(value.toLowerCase()) > -1) { st.quarantined++; continue; }
  const needCompany = companyRaw !== value;
  const needClean = !!cfg.cleanWritable && cleanRaw !== value;
  if (!needCompany && !needClean) { st.unchanged++; continue; }
  const t = classify(source);
  if (t.pipe) st.pipe++;
  if (t.dash) st.dash++;
  if (t.legal) st.legal++;
  if (t.symbol) st.symbol++;
  const payload = {};
  if (needCompany) payload[cfg.companyField] = value;
  if (needClean) payload[cfg.cleanField] = value;
  updates.push({ id: rec.id, fields: payload });
  st.changed++;
}

const chunks = [];
for (let i = 0; i < updates.length; i += 10) { chunks.push({ records: updates.slice(i, i + 10) }); }
st.pages++;
st.batches += chunks.length;

const offset = resp.offset ? String(resp.offset) : '';
const nextUrl = offset ? ('https://api.airtable.com/v0/' + cfg.baseId + '/' + cfg.tableId + '?pageSize=100&offset=' + encodeURIComponent(offset)) : '';
return [{ json: { chunks, chunkCount: chunks.length, pageUrl: nextUrl, more: !!offset } }];