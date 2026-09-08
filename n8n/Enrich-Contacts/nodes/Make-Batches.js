// Make Batches: held people per company (tier zero: record id, Contact Key, LinkedIn URL, Email,
// Contact Source, Title, Phone, Seniority, Department, so the batch can FILL blanks on a held row
// instead of skipping it) plus 100 companies per batch item. The batch item carries everything
// the batch needs and the key of the Hub row it will write: parentExecId (this execution) and
// batchNum, dealt once here, 1..N, so "<parentExecId>-<batchNum>" is unique by construction.
// Domain comes back from People as a lookup (an array of one), read array-safe.
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
const pick=$('Pick Companies').first().json;
const held={};
let heldRows=0;
const one=(v)=>String(Array.isArray(v)?(v[0]||''):(v==null?'':v)).trim();
const many=(v)=>Array.isArray(v)?v.map(x=>(x&&typeof x==='object')?String(x.name||''):String(x)).filter(Boolean):(v?[String((v&&typeof v==='object')?(v.name||''):v)].filter(Boolean):[]);
try{
  for(const it of $('Read People').all()){
    const j=it.json||{}; if(!j.id) continue;
    const f=j.fields||{};
    const d=one(f.Domain).toLowerCase(); if(!d) continue;
    heldRows++;
    (held[d]=held[d]||[]).push({ id:j.id, key:one(f['Contact Key']).toLowerCase(), linkedin:one(f['LinkedIn URL']), email:one(f.Email), sources:many(f['Contact Source']), title:one(f.Title), phone:one(f.Phone), seniority:one(f.Seniority), department:one(f.Department), sourceId:one(f['Source ID']) });
  }
}catch(e){}
const companies=(pick.companies||[]).map(c=>Object.assign({}, c, { heldRows: held[c.domain]||[] }));
const BATCH=100;
const out=[];
for(let i=0;i<companies.length;i+=BATCH){
  out.push({ json: {
    parentExecId: String($execution.id),
    batchNum: out.length+1, batchCount: Math.ceil(companies.length/BATCH),
    base: p.base, clientRecId: p.clientRecId,
    peopleTableId: cfg.peopleTableId, peopleTableName: cfg.peopleTableName, companiesTableId: cfg.companiesTableId, dncTableId: cfg.dncTableId,
    peopleFields: cfg.peopleFields, contactSourceMulti: cfg.contactSourceMulti===true,
    companies: companies.slice(i,i+BATCH)
  } });
}
if(!out.length) throw new Error('Make Batches received no companies; the empty-pick gate should have caught this.');
out[0].json._stats={ heldRows: heldRows, heldCompanies: companies.filter(c=>c.heldRows.length>0).length, companiesIn: companies.length, batches: out.length };
return out;
