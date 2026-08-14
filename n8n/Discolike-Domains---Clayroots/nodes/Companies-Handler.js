
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
const BLACK = new Set(['hr','careers','career','jobs','job','legal','privacy','noreply','no-reply','donotreply','abuse','postmaster','compliance','recruiting','recruitment','press','media','unsubscribe','webmaster','admin','info-security']);
const parseEmails = (cell) => { if(!cell) return []; let s=String(cell).trim().replace(/^\[|\]$/g,''); return s.split(/[,;]+/).map(e=>e.replace(/['"\s]/g,'').trim()).filter(e=>e.includes('@')); };
const keepPublic = (arr) => arr.filter(e=>{ const lp=e.split('@')[0].toLowerCase().split('+')[0]; return !BLACK.has(lp); });
const flat = (r) => { const o={}; for(const k in r){ const v=r[k]; if(v===null||v===undefined) o[k]=''; else if(Array.isArray(v)) o[k]=v.join(', '); else if(typeof v==='object') o[k]=JSON.stringify(v); else o[k]=v; } return o; };
const tag = ((($('Companies Upload').first().json['Tag'])||'')+'').trim();
const rows = $input.all().map(i=>i.json);
const out=[];
for(const r of rows){
  const base=flat(r);
  const emails = keepPublic(parseEmails(r['Public Emails']));
  const cn = cleanCompany(r.Name);
  const meta = { ingested_at:$now.toISO(), Name: cn || (base.Name||''), company_clean:cn, Source:'DiscoLike', Tag:tag };
  if(emails.length) out.push({json:{ ...base, ...meta, segment:'has_public', public_emails_clean:emails.join(', ') }});
  else out.push({json:{ ...base, ...meta, segment:'no_public' }});
}
return out;