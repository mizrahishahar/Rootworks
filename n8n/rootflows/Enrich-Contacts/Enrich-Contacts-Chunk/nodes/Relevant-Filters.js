// Relevant Filters (Supersoniq branch): the gate's read for this chunk, one formula per 100 domains
// for the relevant People rows at the chunk's domains. Relevance is the People formula the client's
// base carries (the decision-maker rule, or manually_approved when none is set).
const inp=$('Chunk Trigger').first().json||{};
const d=Array.from(new Set((inp.companies||[]).map(c=>String(c.domain||'').toLowerCase()).filter(Boolean)));
const esc=(s)=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const out=[];
for(let i=0;i<d.length;i+=100){ const part=d.slice(i,i+100); out.push({ json:{ formula:"AND({relevance}=1, "+(part.length===1?("{Domain}='"+esc(part[0])+"'"):('OR('+part.map(x=>"{Domain}='"+esc(x)+"'").join(',')+')'))+")" } }); }
if(!out.length) out.push({ json:{ formula:"{Domain}=''" } });
return out;
