// Chunk Input: one item for Enrich Contacts Chunk, the Rootflow's contract plus this chunk. The
// worker runs as its own execution and dies with its vendor payloads; the Rootflow keeps lists and
// counters only.
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
const plan=$('Plan Companies').first().json;
const chunk=$input.first().json||{};
if(chunk._empty) return [{ json:{ _empty:true } }];
return [{ json:{ base:p.base, clientRecId:p.clientRecId||'', peopleTableId:cfg.peopleTableId, companiesTableId:cfg.companiesTableId, peopleFields:cfg.peopleFields||[], contactSourceMulti:cfg.contactSourceMulti===true, dncDomains:plan.dncDomains||[], provider:chunk.provider, idx:chunk.idx, count:chunk.count, companies:chunk.companies||[], parentExecId:String($execution.id) } }];
