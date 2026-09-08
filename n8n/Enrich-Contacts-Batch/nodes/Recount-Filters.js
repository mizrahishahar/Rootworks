// Recount Filters: after the writer's stamps, read People again for the batch's domains, ids
// only (Contact Key, LinkedIn URL, Domain), one OR formula per 100 domains: the batch's coverage
// is what the base holds now, and the same held state goes back to the parent, which hands it to
// this batch's AI-Ark pass so AI-Ark is sized to the gap and its exclude list is exact. Domain on
// People is a lookup through the Companies link; filterByFormula {Domain}='x' matches the lookup's
// text, so the read works unchanged.
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
