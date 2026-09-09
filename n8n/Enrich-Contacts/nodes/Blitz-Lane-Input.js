// Lane Input: the one item a provider lane receives, the Rootflow's contract, the same for every
// provider (this file sits behind all four Lane Input nodes). Lanes run in priority order (Blitz,
// GetLeads, QuickEnrich, Supersoniq), each awaited: the earlier lane's rows are held by the time
// the next one writes, so first writer wins by construction. Each lane chunks and paces itself.
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
const plan=$('Plan Companies').first().json;
return [{ json:{ base:p.base, clientRecId:p.clientRecId||'', peopleTableId:cfg.peopleTableId, companiesTableId:cfg.companiesTableId, peopleFields:cfg.peopleFields||[], contactSourceMulti:cfg.contactSourceMulti===true, dncDomains:plan.dncDomains||[], companies:plan.companies||[], parentExecId:String($execution.id) } }];
