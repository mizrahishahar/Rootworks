const g = $('Launch Guard').first().json;
const t = (n) => ({ name: n, type: 'singleLineText' });
const num = (n, p) => ({ name: n, type: 'number', options: { precision: (p===undefined?0:p) } });
const sel = (n, ch) => ({ name: n, type: 'singleSelect', options: { choices: ch.map(c => ({ name: c })) } });
const SEN=['C-Suite','Founder','Owner','President','Executive','VP','Head','Director','Manager','Senior','Partner','EVP / SVP','Board / Chair','Unclassified'];
const DEP=['Executive','Engineering','Technology','R&D','Product','Data','Security','Design','Operations','Sales','Marketing','Finance','Human Resources','Customer Success','Project Management','Strategy','Legal','Supply Chain','Communications','Community & Social','Compliance & GRC'];
const EMP=['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+'];
const fields=[
  t('Name'), t('Contact Key'), t('first_name'), t('last_name'), t('Title'),
  sel('Seniority',SEN), sel('Department',DEP),
  t('Email'), t('Social'), t('Phone'), t('Connections'), t('Domain'), t('Company'),
  t('Industry Groups'), sel('Employees',EMP), t('Business Model'), t('MX Provider'), t('Description'), t('Keywords'),
  t('City'), t('State'), t('Country'), t('Zip'), t('Street'),
  t('Contact Source'), t('Plan'),
  num('Revenue Est Monthly',0), num('Store Age Years',1), num('Product Count',0), num('App Spend Mo',0),
  t('Key Apps'), t('Tech Stack'), num('Trustpilot Rating',1), num('Trustpilot Reviews',0),
  t('Migrated From'), t('Social Followers'), num('Growth 90d',0), t('Features'),
  t('Tag')
];
// Operator ruling 2026-08-12. Removed from the contract: company_clean (cleaning happens on Company
// itself), State Full (State is the only location column), Score, Similarity, Run ID.
// 'Contact Source' replaces 'Source' for record provenance; the Strip Immutable node maps the
// formatter's Source key onto it at the write boundary. 'Email Source' (waterfall tier) is owned
// by the verification lane, which creates it on first touch.
const formulaFields = [ { name: 'Build Date', type: 'formula', options: { formula: 'CREATED_TIME()' } } ];
const desiredName = (g.buildName || 'List') + ' - Contacts';
return [{ json: { mode: g.mode, existingTableId: g.existingTableId, buildNameIgnored: !!g.buildNameIgnored, desiredName, fields, formulaFields } }];