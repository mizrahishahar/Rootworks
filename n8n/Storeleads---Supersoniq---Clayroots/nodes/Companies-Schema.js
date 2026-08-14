const build = ($('Waterfall Storeleads').first().json['Build name']) || 'List';
const name = build + ' - Domains - ' + $now.toFormat('yyyy-MM-dd');
const t = (n) => ({ name: n, type: 'singleLineText' });
const num = (n, p) => ({ name: n, type: 'number', options: { precision: (p===undefined?0:p) } });
const sel = (n, ch) => ({ name: n, type: 'singleSelect', options: { choices: ch } });
const MV=[{name:'ok',color:'greenBright'},{name:'catch_all',color:'yellowBright'},{name:'invalid',color:'redBright'},{name:'disposable',color:'orangeLight2'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const BB=[{name:'verifying',color:'blueBright'},{name:'deliverable',color:'greenBright'},{name:'undeliverable',color:'redBright'},{name:'risky',color:'yellowBright'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const STc=[{name:'done',color:'greenBright'},{name:'verifying',color:'blueBright'},{name:'no_email_found',color:'redBright'},{name:'error',color:'orangeBright'}];
const fields = [
  t('Domain'), t('Company'), t('company_clean'), t('public_emails_clean'), t('Industry Groups'), t('Employees'),
  t('City'), t('State'), t('Country'), t('Description'), t('Plan'),
  num('Revenue Est Monthly',0), num('Store Age Years',1), num('Product Count',0), num('App Spend Mo',0),
  t('Key Apps'), t('Tech Stack'), num('Trustpilot Rating',1), num('Trustpilot Reviews',0),
  t('Migrated From'), t('Social Followers'), t('Features'),
  t('segment'), t('query_name'), t('ingested_at'), t('Source'),
  sel('MV P0', MV), sel('BB', BB), t('Final Email'), sel('Status', STc)
];
return [{ json: { name, fields } }];