
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
  // Raw here; the Clean Fields helper (next node) cleans Name and company_clean (domains-row rule).
  const rawName = String(base.Name||'').trim();
  const meta = { ingested_at:$now.toISO(), Name: rawName, company_clean: rawName, Source:'DiscoLike', Tag:tag };
  if(emails.length) out.push({json:{ ...base, ...meta, segment:'has_public', public_emails_clean:emails.join(', ') }});
  else out.push({json:{ ...base, ...meta, segment:'no_public' }});
}
return out;