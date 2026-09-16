// Verify Handoff: after the last batch, the rows THIS run marked verifying (their ids accumulated in
// the run's Tally by every batch) go to Verify Catch-alls, once, not awaited. Never the whole table:
// a row left verifying by an older run is not this run's to pay for again; a manual launch of
// Verify Catch-alls takes leftovers when the Operator decides. Verify Catch-alls submits each row's
// Email field to BounceBan and writes its own Hub row keyed on this execution.
const p=$('Params').first().json;
let ids=[];
try{ const prior=$('Read Run Row').first().json; const raw=prior&&prior.fields?prior.fields.Tally:null; if(raw){ const t=JSON.parse(String(raw)); if(t&&String(t.execId)===String($execution.id)&&Array.isArray(t.verifyingIds)) ids=Array.from(new Set(t.verifyingIds.map(String))); } }catch(e){}
if(!ids.length) return [{ json:{ _skip:true, count:0 } }];
return [{ json:{ base:p.base, clientRecId:p.clientRecId||'', table:'People', view:'', parentExecId:String($execution.id), rowIds:ids, count:ids.length } }];
