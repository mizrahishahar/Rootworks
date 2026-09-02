// Hub launch path: the Airtable "get" nodes return {id, fields:{...}}; read through fields.
const clientRec = $input.first().json || {};
const client = clientRec.fields || clientRec;
const launchRec = $('Read Launch Record').first().json || {};
const launch = launchRec.fields || launchRec;
const baseId = String(client['Clayroots Base ID'] || '').trim();
// The launch row names its table (People or Companies, blank = People); Resolve Table turns it into the id.
const table = String((launch['Table'] && launch['Table'].name) || launch['Table'] || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) {
  throw new Error('The launch record does not resolve to a Clayroots Base ID (Client link missing or the client has no base). Nothing was written.');
}
return [{ json: { baseId, table, launchRecordId: String(launchRec.id || ''), triggerKind: 'form' } }];
