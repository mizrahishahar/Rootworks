// Held Filters: the chunk's domains, one OR formula per 100, for the read of what People already
// holds there (the fill-blanks rule needs the held row's values). Domain on People is a lookup.
const inp=$('Writer Trigger').first().json||{};
const d=Array.from(new Set((inp.companies||[]).map(c=>String(c.domain||'').toLowerCase()).filter(Boolean)));
const esc=(s)=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const out=[];
for(let i=0;i<d.length;i+=100){ const chunk=d.slice(i,i+100); out.push({ json:{ formula:chunk.length===1?("{Domain}='"+esc(chunk[0])+"'"):('OR('+chunk.map(x=>"{Domain}='"+esc(x)+"'").join(',')+')') } }); }
if(!out.length) out.push({ json:{ formula:"{Domain}=''" } });
return out;
