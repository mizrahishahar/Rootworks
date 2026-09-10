// Writer Input: this chunk's people (from the provider's Parse node) plus the writer's contract, one
// item for Enrich Contacts Writer. The provider on the trigger says which branch ran. An empty
// answer still goes through the writer (one held read, zero written), so the counters stay honest.
const ctx=$('Chunk Trigger').first().json||{};
const PARSE={ Blitz:'BZ Parse', GetLeads:'GL Parse', QuickEnrich:'QE Parse', Supersoniq:'SQ Parse' };
let parsed={}; try{ parsed=$(PARSE[ctx.provider]).first().json||{}; }catch(e){}
return [{ json:{ base:ctx.base, peopleTableId:ctx.peopleTableId, peopleFields:ctx.peopleFields||[], contactSourceMulti:ctx.contactSourceMulti===true, dncDomains:ctx.dncDomains||[], provider:ctx.provider, companies:ctx.companies||[], people:(parsed.people&&typeof parsed.people==='object')?parsed.people:{} } }];
