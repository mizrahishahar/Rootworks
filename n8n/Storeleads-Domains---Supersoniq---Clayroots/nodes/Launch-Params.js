const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const cf=($('Resolve Base').first().json.fields)||{};
const att=Array.isArray(f['Attachment'])?f['Attachment']:[];
if(!att.length){ throw new Error('Launch record '+rec.id+' has no Attachment CSV.'); }
const rawTid=((f['Table ID']||f['Target']||'')+'').trim();
const m=rawTid.match(/tbl[A-Za-z0-9]{14}/);
return [{ json: {
  'Clayroots Base ID': ((cf['Clayroots Base ID']||'')+'').trim(),
  'Build name': ((f['Build name']||'')+'').trim(),
  'Existing Table ID': m?m[0]:rawTid,
  'Tag': ((f['Tag']||'')+'').trim(),
  'Seniority levels (default net pre-ticked; untick to narrow)': f['Seniority']||'',
  'Target departments (tick to narrow; ALL = every department)': f['Departments']||'',
  'Contacts per company': parseInt(f['Contacts per company'],10)||5,
  'Contact location': f['Country']||'',
  '_csvName': (att[0]&&att[0].filename)||'launch.csv',
  '_launchRecordId': rec.id,
  'submittedAt': new Date().toISOString()
} }];