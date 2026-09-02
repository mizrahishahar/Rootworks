// Tier 3: every table in the client's ClayRoots base that has a Domain column gets one search for the booker's domain.
const c=$('Resolve Client').first().json;
const n=$('Normalize Booking').first().json;
const r=$input.first().json||{};
const tables=Array.isArray(r.tables)?r.tables:[];
const domain=String(n.domain||'').toLowerCase().replace(/'/g,'');
if(!c.clayrootsBase||!domain||!tables.length) return [{ json:{ _empty:true, reason:!c.clayrootsBase?'client has no ClayRoots base':(!domain?'booker has no company domain (freemail)':'base has no tables') } }];
const out=[];
for(const t of tables){
  const hasDomain=(t.fields||[]).some(f=>f&&f.name==='Domain');
  if(!hasDomain) continue;
  const formula="LOWER({Domain})='"+domain+"'";
  out.push({ json:{ tableId:t.id, tableName:t.name, url:'https://api.airtable.com/v0/'+c.clayrootsBase+'/'+t.id+'?maxRecords=1&fields%5B%5D=Domain&filterByFormula='+encodeURIComponent(formula) } });
}
if(!out.length) return [{ json:{ _empty:true, reason:'no table with a Domain column in the client base' } }];
return out;
