const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const cf=($('Resolve Base').first().json.fields)||{};
const att=(f['Attachment']||[])[0]||{};
if(!att.url){ throw new Error('Launch record '+rec.id+' has no Attachment CSV.'); }
const tid = (((f['Table ID']||'')+'').trim()) || (((f['Target']||'')+'').trim());
return [{ json: {
  'Clayroots Base ID': ((cf['Clayroots Base ID']||'')+'').trim(),
  'Build name': ((f['Build name']||'')+'').trim(),
  'Existing Table ID': tid,
  'Tag': ((f['Tag']||'')+'').trim(),
  'CSV': { filename: att.filename||'launch.csv', mimetype: att.type||'text/csv' },
  '_launchRecordId': rec.id,
  'submittedAt': new Date().toISOString()
} }];