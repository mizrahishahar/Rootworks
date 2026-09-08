// Verify Handoff: after the last batch, one item for Verify Catch-alls on the WHOLE People table
// (no view): the rows this run just marked verifying have left the view it worked (Not Waterfalled
// is Status empty), and Verify Catch-alls filters Status = verifying itself. Fired, not awaited: it
// writes its own Hub row keyed on this execution.
const p=$('Params').first().json;
return [{ json:{ base:p.base, clientRecId:p.clientRecId||'', table:'People', view:'', parentExecId:String($execution.id) } }];
