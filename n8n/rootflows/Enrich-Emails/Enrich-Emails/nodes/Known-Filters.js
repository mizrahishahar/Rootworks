// Known Filters: the domains of this batch, one OR formula per 100, for the read of what the base
// already PROVES at those domains: People rows with Status = done carry a verified Final Email, and
// from them the domain's address pattern is inferred (one guess instead of six) and a domain that
// BounceBan verified is known catch-all before anyone is asked. Domain on People is a lookup.
const rows=$('Read Records').all().map(i=>i.json||{}).filter(j=>j.id);
const norm=(v)=>String(Array.isArray(v)?(v[0]||''):(v||'')).trim().toLowerCase();
const d=Array.from(new Set(rows.map(r=>norm((r.fields||{}).Domain)).filter(Boolean)));
const esc=(s)=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const out=[];
for(let i=0;i<d.length;i+=100){ const chunk=d.slice(i,i+100); out.push({ json:{ formula:"AND({Status}='done',"+(chunk.length===1?("{Domain}='"+esc(chunk[0])+"'"):('OR('+chunk.map(x=>"{Domain}='"+esc(x)+"'").join(',')+')'))+")" } }); }
if(!out.length) out.push({ json:{ formula:"{Domain}=''" } });
return out;
