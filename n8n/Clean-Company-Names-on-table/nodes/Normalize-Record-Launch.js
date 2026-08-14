const client = $input.first().json;
const launch = $('Read Launch Record').first().json;
const baseId = String(client['Clayroots Base ID'] || '').trim();
const tableId = String(launch['Table ID'] || launch['Target'] || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) {
  throw new Error('The launch record does not resolve to a Clayroots Base ID. Nothing was written.');
}
return [{ json: { baseId, tableId, launchRecordId: String(launch.id || ''), triggerKind: 'webhook' } }];