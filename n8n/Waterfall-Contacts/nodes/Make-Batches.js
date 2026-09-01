// Make Batches: held people per company (tier zero: count, Contact Keys, LinkedIn URLs) plus
// 250 companies per batch item. The batch item carries everything the sub needs; the sub
// does the paid work and returns counters only.
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
const pick=$('Pick Companies').first().json;
const held={};
let heldRows=0;
try{
  for(const it of $('Read People').all()){
    const j=it.json||{}; if(!j.id) continue;
    const f=j.fields||{};
    const d=String(f.Domain||'').trim().toLowerCase(); if(!d) continue;
    heldRows++;
    const h=held[d]||(held[d]={ count:0, keys:[], linkedin:[] });
    h.count++;
    const k=String(f['Contact Key']||'').trim().toLowerCase(); if(k) h.keys.push(k);
    const li=String(f['LinkedIn URL']||'').trim(); if(li) h.linkedin.push(li);
  }
}catch(e){}
const companies=(pick.companies||[]).map(c=>{ const h=held[c.domain]||{ count:0, keys:[], linkedin:[] }; return Object.assign({}, c, { heldCount:h.count, heldKeys:h.keys, heldLinkedin:h.linkedin }); });
const BATCH=250;
const out=[];
for(let i=0;i<companies.length;i+=BATCH){
  out.push({ json: {
    batchNum: out.length+1, batchCount: Math.ceil(companies.length/BATCH),
    base: p.base, clientRecId: p.clientRecId,
    peopleTableId: cfg.peopleTableId, companiesTableId: cfg.companiesTableId, dncTableId: cfg.dncTableId,
    peopleFields: cfg.peopleFields,
    sources: p.sources, cgDepartments: p.cgDepartments, arkFunctions: p.arkFunctions, tag: p.tag,
    companies: companies.slice(i,i+BATCH)
  } });
}
if(!out.length) throw new Error('Make Batches received no companies; the empty-pick gate should have caught this.');
out[0].json._stats={ heldRows: heldRows, heldCompanies: companies.filter(c=>c.heldCount>0).length, companiesIn: companies.length, batches: out.length };
return out;
