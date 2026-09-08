// Event Params: the sub-workflow entry. Enrich Emails fires it after its last batch with the table
// and view it worked; the hourly schedule fires it once per client with the whole People table.
const j=$input.first().json||{};
const base=String(j.base||j.baseId||'').trim();
if(!/^app[A-Za-z0-9]{14}$/.test(base)) throw new Error('Verify Catch-alls was called without a valid base. Nothing was verified.');
return [{ json:{ base, clientRecId:String(j.clientRecId||j.clientRecordId||'').trim(), table:'People', view:String(j.view||'').trim(), trigger:j.trigger==='schedule'?'schedule':'event', _launchRecordId:'', parentExecId:String(j.parentExecId||''), startedAt:new Date().toISOString() } }];
