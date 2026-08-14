const inp = $input.first().json;
const b = inp.body || {};
const qp = b.query_params || {};
const recs = b.query_result || [];
let isCompanies=false;
if('context_mode' in qp||'web_search' in qp||'search_source' in qp) isCompanies=true;
else if('include_search_contacts' in qp||'seniority' in qp||'icp_text' in qp) isCompanies=false;
else if(recs.length&&(('public emails' in recs[0])||('business model' in recs[0])||('revenue range' in recs[0]))) isCompanies=true;
else if(recs.length&&(('_discogen_span' in recs[0])||('persona_id' in recs[0])||('contact_count' in recs[0]))) isCompanies=false;
const titleCase = (s) => String(s).replace(/\w\S*/g, t => t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());
const cleanFirst = (full) => { if(!full) return ''; let n=String(full).split(',')[0].trim().split(/\s+/)[0]||''; n=n.replace(/[^A-Za-z\-']/g,''); return n? n.charAt(0).toUpperCase()+n.slice(1).toLowerCase():''; };
const cleanLast = (full) => { if(!full) return ''; let p=String(full).split(',')[0].trim().split(/\s+/); if(p.length<2) return ''; return titleCase(p.slice(1).join(' ').replace(/[^A-Za-z\-'\s]/g,'').trim()); };
const cleanCompany = (name) => { if(!name) return ''; let c=String(name).trim().replace(/[®™]/g,''); for(let i=0;i<2;i++){ c=c.replace(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i,'').trim(); } return c.replace(/,+$/,'').trim(); };
const BLACK = new Set(['hr','careers','career','jobs','job','legal','privacy','noreply','no-reply','donotreply','abuse','postmaster','compliance','recruiting','recruitment','press','media','unsubscribe','webmaster','admin','info-security']);
const keepPublic = (arr) => { if(!Array.isArray(arr)) arr=arr?[arr]:[]; return arr.filter(e=>{ if(!e||typeof e!=='string'||!e.includes('@'))return false; const lp=e.split('@')[0].toLowerCase().split('+')[0]; return !BLACK.has(lp); }); };
const flat = (r) => { const o={}; for(const k in r){ const v=r[k]; if(v===null||v===undefined) o[k]=''; else if(Array.isArray(v)) o[k]=v.map(x=>(x&&typeof x==='object')?(x.phone||JSON.stringify(x)):x).join(', '); else if(typeof v==='object') o[k]=Object.keys(v).join('; '); else o[k]=v; } return o; };
const qname=b.query_name||''; const qid=b.query_id||'';
const out=[];
for(const r of recs){
  const base=flat(r);
  const meta={ source:'discolike', query_id:qid, query_name:qname, ingested_at:$now.toISO() };
  if(!isCompanies){
    const isContact=('_discogen_span' in r)?(r._discogen_span!==null&&r._discogen_span!==undefined):!!r.name;
    if(isContact){
      out.push({json:{ ...base, ...meta, segment:'contacts', _row_uid:r._row_uid||'', first_name:cleanFirst(r.name), last_name:cleanLast(r.name), company_clean:cleanCompany(r.company_name) }});
    } else if(Number(r.contact_count||0)===0){
      out.push({json:{ ...base, ...meta, segment:'no_contacts', _row_uid:r._row_uid||'', company_clean:cleanCompany(r.company_name) }});
    }
  } else {
    const kept=keepPublic(r['public emails']);
    if(kept.length) out.push({json:{ ...base, ...meta, segment:'has_public', _row_uid:r._row_uid||'', company_clean:cleanCompany(r.name), public_emails_clean:kept.join(', ') }});
    else out.push({json:{ ...base, ...meta, segment:'no_public', _row_uid:r._row_uid||'', company_clean:cleanCompany(r.name) }});
  }
}
return out;