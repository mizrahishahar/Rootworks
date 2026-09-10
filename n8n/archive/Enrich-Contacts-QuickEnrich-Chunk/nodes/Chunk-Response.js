// Chunk Response: the last node of the QuickEnrich chunk worker, what the lane receives: the vendor
// verdict (status, reason, stats) and the writer's counters. Never rows, never payloads.
let p={}; try{ p=$('QE Parse').first().json||{}; }catch(e){}
let w={}; try{ w=$('Call Writer').first().json||{}; }catch(e){}
const writer=(w.error&&w.written===undefined)?{ crashed:String((w.error&&w.error.message)||w.error).slice(0,160) }:w;
return [{ json:{ provider:'QuickEnrich', parse:{ status:p.status||'error', reason:p.reason||'', stats:p.stats||{} }, writer } }];
