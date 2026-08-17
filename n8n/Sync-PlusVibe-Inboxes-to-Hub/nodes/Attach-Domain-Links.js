const rows=$('Build Inbox Rows').all().map(i=>i&&i.json).filter(Boolean);
let domainRecs=[]; try{ domainRecs=$('Upsert Domains').all().map(i=>i.json).filter(Boolean); }catch(e){}
const domainMap={};
for(const d of domainRecs){ const nm = d.fields ? d.fields['Domain'] : d['Domain']; if(d.id && nm) domainMap[nm]=d.id; }
if(!rows.length || (rows.length===1 && rows[0]._keepAlive)) return [{ json: { _keepAlive:true } }];
return rows.map(r=>{
  const domainRecId = r.Domain ? domainMap[r.Domain] : null;
  return { json: Object.assign({}, r, { 'Domain Link': domainRecId?[domainRecId]:[] }) };
});