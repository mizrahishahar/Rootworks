// Compact Persons: the persons door's response, aligned by index to the ids asked for.
// { count, errors, rows:[{personId, name, firstName, lastName, title, linkedinUrl, email, http}] }
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
let asked=[]; try{ asked=$('Split Person Ids').all().map(i=>i.json); }catch(e){}
const resp=$input.all();
const rows=[]; let errors=0;
for(let i=0;i<asked.length;i++){
  const a=asked[i]||{};
  if(a._empty) continue;
  const r=(resp[i]&&resp[i].json)||{};
  const http=Number(r.statusCode)||0;
  const body=parse(r.body===undefined?r:r.body)||{};
  const first=String(body.firstName||'').trim(), last=String(body.lastName||'').trim();
  if(!(http>=200&&http<300)||!(first||last||body.linkedinUrl)) errors++;
  rows.push({ personId:a.personId, name:(first+' '+last).trim(), firstName:first, lastName:last,
    title:String(body.title||'').trim(), linkedinUrl:String(body.linkedinUrl||'').trim(),
    email:String(body.email||'').trim(), http });
}
return [{ json: { count:rows.length, errors, rows } }];
