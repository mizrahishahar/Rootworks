const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const client=$('Resolve Base').first().json;
const cf=client.fields||{};
const arr=v=>Array.isArray(v)?v:(v?[v]:[]);
const sen=arr(f['Seniority']);
const dep=arr(f['Departments']);
const loc=arr(f['Country']);
const att=(f['Attachment']||[])[0]||{};
if(!att.url){ throw new Error('Launch record '+rec.id+' has no Attachment CSV.'); }
const tid = (((f['Table ID']||'')+'').trim()) || (((f['Target']||'')+'').trim());
return [{ json: {
  'Clayroots Base ID': ((cf['Clayroots Base ID']||'')+'').trim(),
  'Build name': ((f['Build name']||'')+'').trim(),
  'Existing Table ID': tid,
  'Tag': ((f['Tag']||'')+'').trim(),
  'ContaGen contacts CSV': { filename: att.filename||'launch.csv', mimetype: att.type||'text/csv' },
  'Seniority levels (default net pre-ticked; untick to narrow)': sen.length?sen:['C-Suite','Founder','Owner','President','VP','Head','Director'],
  'Target departments': dep.length?dep:['ALL'],
  'Contacts per company': f['Contacts per company']||5,
  'Contact location': loc.length?loc:['United States'],
  '_launchRecordId': rec.id,
  'submittedAt': new Date().toISOString()
} }];