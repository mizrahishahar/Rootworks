const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const cf=($('Resolve Base').first().json.fields)||{};
const tid = (((f['Table ID']||'')+'').trim()) || (((f['Target']||'')+'').trim());
return [{ json: {
  'Clayroots Base ID': ((cf['Clayroots Base ID']||'')+'').trim(),
  'Build name': ((f['Build name']||'')+'').trim(),
  'Existing Table ID': tid,
  'Tag': ((f['Tag']||'')+'').trim(),
  'Country': f['Country']||'',
  'Platforms (tick any; none = all platforms)': f['Platforms']||'',
  'Plan': f['Plan']||'',
  'Monthly revenue': f['Monthly revenue']||'',
  'Employees': f['Employees']||'',
  'Product count': f['Product count']||'',
  'Store age': f['Store age']||'',
  'Min monthly visits': f['Min monthly visits']||'',
  'Category': f['Category']||'',
  'Technologies': f['Technologies']||'',
  'Must-have app IDs (comma-separated, platform.token format, e.g. shopify.klaviyo-email-marketing)': f['Must-have app IDs']||'',
  'Max companies': parseInt(f['Max companies'], 10) || 500,
  '_launchRecordId': rec.id,
  'submittedAt': new Date().toISOString()
} }];