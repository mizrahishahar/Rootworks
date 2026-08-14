const build = ($('Waterfall Storeleads').first().json['Build name']) || 'List';
const name = build + ' - Contacts - ' + $now.toFormat('yyyy-MM-dd');
const t = (n) => ({ name: n, type: 'singleLineText' });
const num = (n, p) => ({ name: n, type: 'number', options: { precision: (p===undefined?0:p) } });
const sel = (n, ch) => ({ name: n, type: 'singleSelect', options: { choices: ch.map(c=>({ name: c })) } });
const fields = [
  t('Contact Key'), t('Name'), t('first_name'), t('last_name'), t('Title'),
  sel('Seniority', ['C-Suite','Founder','Owner','President','Executive','VP','Head','Director','Manager','Senior','Partner','EVP / SVP','Board / Chair','Unclassified']),
  sel('Department', ['Executive','Engineering','Technology','R&D','Product','Data','Security','Design','Operations','Sales','Marketing','Finance','Human Resources','Customer Success','Project Management','Strategy','Legal','Supply Chain','Communications','Community & Social','Compliance & GRC']),
  t('Email'), t('Social'), t('Phone'), t('Connections'), t('Domain'), t('Company'), t('company_clean'), t('Industry Groups'),
  sel('Employees', ['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+']),
  t('Score'), t('Similarity'), t('Description'), t('Keywords'), t('City'), t('State'), t('State Full'), t('Country'), t('Zip'), t('Street'),
  t('segment'), t('query_name'), t('ingested_at'), t('Source'),
  t('Plan'), num('Revenue Est Monthly',0), num('Store Age Years',1), num('Product Count',0), num('App Spend Mo',0), t('Key Apps'), t('Tech Stack'), num('Trustpilot Rating',1), num('Trustpilot Reviews',0), t('Migrated From'), t('Social Followers'), num('Growth 90d',0), t('Features')
];
fields.push({ name: 'RankInCompany', type: 'number', options: { precision: 0 } });
return [{ json: { name, fields } }];