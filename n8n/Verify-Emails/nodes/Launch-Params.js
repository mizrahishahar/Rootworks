const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const client=$('Resolve Base').first().json;
const cf=client.fields||{};
return [{ json: {
  'Clayroots Base ID': ((cf['Clayroots Base ID']||'')+'').trim(),
  'Table': ((f['Table']||'')+'').trim(),
  'Max Rows': f['Max Rows'] || 0,
  'View': ((f['View']||'')+'').trim(),
  '_launchRecordId': rec.id,
  'submittedAt': new Date().toISOString()
} }];