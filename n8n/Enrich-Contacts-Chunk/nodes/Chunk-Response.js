// Chunk Response: the last node, what the Rootflow receives: the vendor verdict (status, reason,
// stats, the Supersoniq gate counts when that branch ran) and the writer's counters. Never rows.
const ctx=$('Chunk Trigger').first().json||{};
const PARSE={ Blitz:'BZ Parse', GetLeads:'GL Parse', QuickEnrich:'QE Parse', Supersoniq:'SQ Parse' };
let p={}; try{ p=$(PARSE[ctx.provider]).first().json||{}; }catch(e){}
let w={}; try{ w=$('Call Writer').first().json||{}; }catch(e){}
const writer=(w.error&&w.written===undefined)?{ crashed:String((w.error&&w.error.message)||w.error).slice(0,160) }:w;
return [{ json:{ provider:ctx.provider, parse:{ status:p.status||'error', reason:p.reason||'', stats:p.stats||{} }, writer } }];
