const rec=$('Fetch Launch Record').first().json;
const f=rec.fields||{};
const cf=($('Resolve Base').first().json.fields)||{};
const arr=v=>Array.isArray(v)?v:(v?[v]:[]);
return [{ json: {
  'Clayroots Base ID': ((cf['Clayroots Base ID']||'')+'').trim(),
  'Build name': ((f['Build name']||'')+'').trim(),
  'Country': arr(f['Country']).length?arr(f['Country']):['United States'],
  'Platforms (tick any; none = all platforms)': arr(f['Platforms']),
  'Monthly revenue': arr(f['Monthly revenue']).length?arr(f['Monthly revenue']):['$100k-500k'],
  'Employees': arr(f['Employees']),
  'Product count': arr(f['Product count']),
  'Store age': arr(f['Store age']),
  'Must-have app IDs (comma-separated, platform.token format, e.g. shopify.klaviyo-email-marketing)': ((f['Must-have app IDs']||'')+'').trim(),
  'Max companies': f['Max companies']||500,
  'Contacts per company': f['Contacts per company']||5,
  'Seniority levels (default net pre-ticked; untick to narrow)': arr(f['Seniority']).length?arr(f['Seniority']):['C-Suite','Founder','Owner','President','VP','Head','Director'],
  'Target departments (tick to narrow; ALL = every department)': arr(f['Departments']).length?arr(f['Departments']):['ALL'],
  '_launchRecordId': rec.id,
  'submittedAt': new Date().toISOString()
} }];