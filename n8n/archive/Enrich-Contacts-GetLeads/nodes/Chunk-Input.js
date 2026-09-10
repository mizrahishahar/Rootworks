// Chunk Input: one item for the GetLeads chunk worker, the lane's contract plus this chunk's
// companies. The worker runs as its own execution and dies with its vendor payloads (ruled
// 2026-09-09 after the CaaB out-of-memory crash: a lane execution must never grow with the list;
// it holds chunk lists and counters, nothing the vendor answered).
const ctx=$('Enrich Trigger').first().json||{};
const chunk=$input.first().json||{};
return [{ json:{ base:ctx.base, peopleTableId:ctx.peopleTableId, peopleFields:ctx.peopleFields||[], contactSourceMulti:ctx.contactSourceMulti===true, dncDomains:ctx.dncDomains||[], provider:'GetLeads', idx:chunk.idx, count:chunk.count, companies:chunk.companies||[] } }];
