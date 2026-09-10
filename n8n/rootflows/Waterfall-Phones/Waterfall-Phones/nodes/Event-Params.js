// Event Params: the record door of Enrich Phones. A caller POSTs {baseId, clientRecordId, table,
// view} for a People view; the door answers 200 on receipt and the run carries on alone, so a
// caller never waits on a phone lookup. Same shape as Enrich Emails' record door.
const b=($input.first().json||{}).body||{};
const base=String(b.baseId||b.base||'').trim();
const table=String(b.table||'People').trim();
const view=String(b.view||'').trim();
if(!/^app[A-Za-z0-9]{14}$/.test(base)) throw new Error('Enrich Phones record door: no valid baseId in the body. No provider was called.');
if(table.toLowerCase()!=='people') throw new Error('Enrich Phones record door: Table "'+table+'" is not People. No provider was called.');
if(!view) throw new Error('Enrich Phones record door: no view in the body. A People view is the spend cap. No provider was called.');
return [{ json:{ refused:'', base, clientRecId:String(b.clientRecordId||b.clientRecId||'').trim(), table:'People', view, tag:'', trigger:'event', _launchRecordId:'', startedAt:new Date().toISOString() } }];
