// Event Params: the sub-workflow entry. Enrich Emails fires it once after its last batch with the
// ids of the rows that run marked verifying; only those rows are submitted, never the whole table.
// No schedule exists: leftovers are taken by a manual launch (the form door) when the Operator
// decides, which reads every Status = verifying row of the base.
const j=$input.first().json||{};
const base=String(j.base||j.baseId||'').trim();
if(!/^app[A-Za-z0-9]{14}$/.test(base)) throw new Error('Verify Catch-alls was called without a valid base. Nothing was verified.');
const rowIds=(Array.isArray(j.rowIds)?j.rowIds:[]).map(String).filter(x=>/^rec[A-Za-z0-9]{14}$/.test(x));
return [{ json:{ base, clientRecId:String(j.clientRecId||j.clientRecordId||'').trim(), table:'People', view:String(j.view||'').trim(), trigger:'event', _launchRecordId:'', parentExecId:String(j.parentExecId||''), rowIds, startedAt:new Date().toISOString() } }];
