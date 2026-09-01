// People Filters: tier zero reads what the base already holds at these domains, ids only
// (Contact Key, LinkedIn URL, Domain). One OR formula per 100 domains keeps every request
// under Airtable's URL limit; Read People runs once per item and returns all pages.
const d=$input.first().json.domains||[];
const esc=(s)=>String(s).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const out=[];
for(let i=0;i<d.length;i+=100){
  const chunk=d.slice(i,i+100);
  out.push({ json: { formula: chunk.length===1?("{Domain}='"+esc(chunk[0])+"'"):('OR('+chunk.map(x=>"{Domain}='"+esc(x)+"'").join(',')+')') } });
}
if(!out.length) out.push({ json: { formula: "{Domain}=''" } });
return out;
