// Relevant Filters: the Supersoniq gate (ruled 2026-09-09). Supersoniq is the one metered source and
// runs last, so by now the free lanes have written. Ask it only for companies that still hold
// fewer than 5 relevant people. Relevance is the People formula the client's base carries (the
// decision-maker rule, or manually_approved when none is set: then nothing is relevant and every
// company passes the gate). One formula per 100 domains reads only the relevant rows.
const plan=$('Plan Companies').first().json;
const d=Array.from(new Set((plan.companies||[]).map(c=>String(c.domain||'').toLowerCase()).filter(Boolean)));
const esc=(s)=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const out=[];
for(let i=0;i<d.length;i+=100){ const part=d.slice(i,i+100); out.push({ json:{ formula:"AND({relevance}=1, "+(part.length===1?("{Domain}='"+esc(part[0])+"'"):('OR('+part.map(x=>"{Domain}='"+esc(x)+"'").join(',')+')'))+")" } }); }
if(!out.length) out.push({ json:{ formula:"{Domain}=''" } });
return out;
