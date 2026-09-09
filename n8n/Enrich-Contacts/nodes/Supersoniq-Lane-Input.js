// Supersoniq Lane Input: the lane contract, gated (ruled 2026-09-09): only companies with fewer than
// RELEVANT_MIN relevant people after the free lanes wrote. Read Relevant People answered with the
// relevant rows at the run's domains (one item each, Domain as a lookup array); they are counted
// per domain here. A base without a relevance rule has zero relevant rows, so every company passes.
const RELEVANT_MIN=5;
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
const plan=$('Plan Companies').first().json;
const count={};
try{ for(const it of $('Read Relevant People').all()){ const j=it.json||{}; if(!j.id) continue; const f=j.fields||{}; const v=f.Domain; const d=String(Array.isArray(v)?(v[0]||''):(v||'')).toLowerCase().trim(); if(d) count[d]=(count[d]||0)+1; } }catch(e){}
const all=plan.companies||[];
const companies=all.filter(c=>(count[String(c.domain||'').toLowerCase()]||0)<RELEVANT_MIN);
return [{ json:{ base:p.base, clientRecId:p.clientRecId||'', peopleTableId:cfg.peopleTableId, companiesTableId:cfg.companiesTableId, peopleFields:cfg.peopleFields||[], contactSourceMulti:cfg.contactSourceMulti===true, dncDomains:plan.dncDomains||[], companies, parentExecId:String($execution.id), gate:{ relevantMin:RELEVANT_MIN, companiesIn:all.length, asked:companies.length, skippedRelevant:all.length-companies.length } } }];
