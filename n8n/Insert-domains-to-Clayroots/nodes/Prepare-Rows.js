// Prepare Rows: the rows Read Meta kept, minus the domains on the client's DNC table (counted,
// never landed), narrowed to the keys Check Columns approved. Tag from _meta goes on every row
// when it is set. A row carrying Public Emails gets an empty public_emails_clean so Clean
// Fields fills it. One {_empty:true} placeholder when nothing is left, so the close still runs.
const m=$('Read Meta').first().json; const c=$('Check Columns').first().json;
const dnc=new Set();
for(const it of $('Get DNC Domains').all()){ const j=it.json||{}; const d=String((j.fields&&j.fields.Domain)||j.Domain||'').trim().toLowerCase(); if(d) dnc.add(d); }
const writable=new Set(c.writable||[]);
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const out=[];
for(const r of (m.rows||[])){
  if(dnc.has(r.Domain)) continue;
  const o={}; for(const k of Object.keys(r)){ if(writable.has(k)) o[k]=r[k]; }
  if(has(o,'Public Emails')&&!has(o,'public_emails_clean')) o.public_emails_clean='';
  if(m.tag) o.Tag=m.tag;
  out.push({ json: o });
}
if(!out.length) return [{ json: { _empty: true } }];
return out;
