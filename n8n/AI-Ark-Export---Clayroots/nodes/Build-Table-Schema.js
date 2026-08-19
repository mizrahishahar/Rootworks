const g = $('Launch Guard').first().json;
const t = (n) => ({ name: n, type: 'singleLineText' });
const sel = (n, ch) => ({ name: n, type: 'singleSelect', options: { choices: ch.map(c=>({ name: c })) } });
// Fixed contract only - no scanning of the raw AI-Ark CSV for extra columns. Company data
// comes exclusively from the Domains table (whatever fields it actually has); AI-Ark's own
// company columns are dropped entirely, never turned into new table fields.
const fields = [
  t('Name'), t('Contact Key'), t('first_name'), t('last_name'), t('Title'),
  sel('Seniority', ['C-Suite','Founder','Owner','President','Executive','VP','Head','Director','Manager','Senior','Partner','EVP / SVP','Board / Chair','Unclassified']),
  sel('Department', ['Executive','Engineering','Technology','R&D','Product','Data','Security','Design','Operations','Sales','Marketing','Finance','Human Resources','Customer Success','Project Management','Strategy','Legal','Supply Chain','Communications','Community & Social','Compliance & GRC']),
  t('Email'), t('Social'), t('Phone'), t('Connections'), t('Domain'), t('Company'), t('Industry Groups'),
  sel('Employees', ['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+']),
  t('Business Model'), t('MX Provider'),
  t('Description'), t('Keywords'), t('City'), t('State'), t('Country'), t('Zip'), t('Street'),
  sel('Contact Source', ['ContaGen','Supersoniq','AI Ark']),
  t('Tag')
];
const formulaFields = [ { name: 'Build Date', type: 'formula', options: { formula: 'CREATED_TIME()' } } ];
const desiredName = (g.buildName || 'List') + ' - Contacts';
return [{ json: { mode: g.mode, existingTableId: g.existingTableId, buildNameIgnored: !!g.buildNameIgnored, desiredName, fields, formulaFields } }];