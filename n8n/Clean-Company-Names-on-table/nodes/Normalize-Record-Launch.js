// Hub launch path: the Airtable "get" nodes return {id, fields:{...}}; read through fields.
const clientRec = $input.first().json || {};
const client = clientRec.fields || clientRec;
const launchRec = $('Read Launch Record').first().json || {};
const launch = launchRec.fields || launchRec;
const baseId = String(client['Clayroots Base ID'] || '').trim();
const tableId = String(launch['Table ID'] || launch['Target'] || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) {
  throw new Error('The launch record does not resolve to a Clayroots Base ID (Client link missing or the client has no base). Nothing was written.');
}
if (!/^tbl[A-Za-z0-9]{14}$/.test(tableId)) {
  throw new Error('The launch record carries no Table ID. Nothing was written.');
}
return [{ json: { baseId, tableId, launchRecordId: String(launchRec.id || ''), triggerKind: 'form' } }];
