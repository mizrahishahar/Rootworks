// Launch Params: the launch row is the contract. Client resolves the base, Table names People
// or Companies (blank = People), Key Column and Fields to Attach shape the merge, Attachment is
// the CSV. Tag and the Client id ride along for the Companies path, where the helper stamps
// the Tag on every row landed.
const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const cf=($('Resolve Base').first().json.fields)||{};
const att=(f['Attachment']&&f['Attachment'][0])||null;
if(!att||!att.url){ throw new Error('Launch guard: launch record '+rec.id+' has no CSV file in the Attachment field. Nothing was written.'); }
return [{ json: {
  'Clayroots Base ID': ((cf['Clayroots Base ID']||'')+'').trim(),
  'Table': (((f['Table']&&f['Table'].name)||f['Table']||'')+'').trim(),
  'Key column': ((f['Key Column']||'Domain')+'').trim(),
  'Fields to attach': ((f['Fields to Attach']||'')+'').trim(),
  'Tag': ((f['Tag']||'')+'').trim(),
  _clientRecId: ((f['Client']||[])[0])||'',
  _attachmentUrl: att.url,
  _launchRecordId: rec.id,
  submittedAt: new Date().toISOString()
} }];
