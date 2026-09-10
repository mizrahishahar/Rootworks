// Event Params: the record door. Enrich Contacts POSTs {baseId, clientRecordId, table, view} once
// after its last batch (the best use of this Rootflow: the People view "Not Waterfalled"); any
// caller may POST the same shape for any People view. The door answers 200 on receipt and the run
// carries on alone, so a caller never waits on a verification.
const b=($input.first().json||{}).body||{};
const base=String(b.baseId||b.base||'').trim();
const table=String(b.table||'People').trim();
const view=String(b.view||'').trim();
if(!/^app[A-Za-z0-9]{14}$/.test(base)) throw new Error('Enrich Emails record door: no valid baseId in the body. Nothing was verified.');
if(table.toLowerCase()!=='people') throw new Error('Enrich Emails record door: Table "'+table+'" is not People. Nothing was verified.');
if(!view) throw new Error('Enrich Emails record door: no view in the body. Nothing was verified.');
return [{ json:{ base, clientRecId:String(b.clientRecordId||b.clientRecId||'').trim(), table:'People', view, tag:'', trigger:'event', _launchRecordId:'', startedAt:new Date().toISOString() } }];
