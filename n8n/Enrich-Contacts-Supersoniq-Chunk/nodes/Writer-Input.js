// Writer Input: this chunk's people (from SQ Parse) plus the writer's contract, one item for the
// writer helper. An empty answer still goes through the writer (it costs one held read and returns
// zero), so the counters stay honest and simple. The chunk worker's trigger carries the contract.
const ctx=$('Chunk Trigger').first().json||{};
let parsed={}; try{ parsed=$('SQ Parse').first().json||{}; }catch(e){}
return [{ json:{ base:ctx.base, peopleTableId:ctx.peopleTableId, peopleFields:ctx.peopleFields||[], contactSourceMulti:ctx.contactSourceMulti===true, dncDomains:ctx.dncDomains||[], provider:'Supersoniq', companies:ctx.companies||[], people:(parsed.people&&typeof parsed.people==='object')?parsed.people:{} } }];
