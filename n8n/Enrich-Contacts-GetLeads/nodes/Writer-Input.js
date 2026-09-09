// Writer Input: this chunk's people (from GL Parse) plus the writer's contract, one item for the
// writer helper. An empty answer still goes through the writer (it costs one held read and returns
// zero), so the lane's counters stay honest and simple.
const ctx=$('Enrich Trigger').first().json||{};
const chunk=$('Chunk Loop').first().json||{};
let parsed={}; try{ parsed=$('GL Parse').first().json||{}; }catch(e){}
return [{ json:{ base:ctx.base, peopleTableId:ctx.peopleTableId, peopleFields:ctx.peopleFields||[], contactSourceMulti:ctx.contactSourceMulti===true, dncDomains:ctx.dncDomains||[], provider:'GetLeads', companies:chunk.companies||[], people:(parsed.people&&typeof parsed.people==='object')?parsed.people:{} } }];
