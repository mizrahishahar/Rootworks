// Recount Filters: after the first two tiers are upserted, read People again for the batch
// domains (ids only: Contact Key, LinkedIn URL, Domain) so AI-Ark is sized to what the base
// holds now and its exclude list is exact. One OR formula per 100 domains.
const plan=$('Plan Batch').first().json;
const d=plan.plan.map(c=>c.domain);
const esc=(s)=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const out=[];
for(let i=0;i<d.length;i+=100){
  const chunk=d.slice(i,i+100);
  out.push({ json: { formula: chunk.length===1?("{Domain}='"+esc(chunk[0])+"'"):('OR('+chunk.map(x=>"{Domain}='"+esc(x)+"'").join(',')+')') } });
}
if(!out.length) out.push({ json: { formula: "{Domain}=''" } });
return out;
