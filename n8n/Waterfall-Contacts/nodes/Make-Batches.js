// Make Batches: held people per company (tier zero: count, Contact Keys, LinkedIn URLs) plus
// 250 companies per batch item, mode "writer" (ContaGen and Supersoniq, the People writer, the
// stamps; AI-Ark is a second pass over the whole run after the last batch, see Ark Pass Item).
// The batch item carries everything the batch needs and the key of the Hub row it will write:
// parentExecId (this execution) and batchNum, dealt once here, 1..N, so "<parentExecId>-<batchNum>"
// is unique by construction. Domain comes back from People as a lookup (an array of one), read
// array-safe.
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
const pick=$('Pick Companies').first().json;
const held={};
let heldRows=0;
const domainOf=(f)=>{ const v=f.Domain; return String(Array.isArray(v)?(v[0]||''):(v||'')).trim().toLowerCase(); };
try{
  for(const it of $('Read People').all()){
    const j=it.json||{}; if(!j.id) continue;
    const f=j.fields||{};
    const d=domainOf(f); if(!d) continue;
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
    mode: 'writer',
    parentExecId: String($execution.id),
    batchNum: out.length+1, batchCount: Math.ceil(companies.length/BATCH),
    base: p.base, clientRecId: p.clientRecId,
    peopleTableId: cfg.peopleTableId, peopleTableName: cfg.peopleTableName, companiesTableId: cfg.companiesTableId, dncTableId: cfg.dncTableId,
    peopleFields: cfg.peopleFields,
    tiers: p.tiers, sources: p.sources, arkOnly: p.arkOnly, roles: p.roles,
    cgDepartments: p.cgDepartments, arkFunctions: p.arkFunctions,
    cgSeniority: p.cgSeniority, sqSeniority: p.sqSeniority, arkSeniority: p.arkSeniority,
    companies: companies.slice(i,i+BATCH)
  } });
}
if(!out.length) throw new Error('Make Batches received no companies; the empty-pick gate should have caught this.');
out[0].json._stats={ heldRows: heldRows, heldCompanies: companies.filter(c=>c.heldCount>0).length, companiesIn: companies.length, batches: out.length };
return out;
