const g = $('Launch Guard').first().json;
const t = (n) => ({ name: n, type: 'singleLineText' });
const num = (n, p) => ({ name: n, type: 'number', options: { precision: (p===undefined?0:p) } });
const sel = (n, ch) => ({ name: n, type: 'singleSelect', options: { choices: ch } });
const MV=[{name:'ok',color:'greenBright'},{name:'catch_all',color:'yellowBright'},{name:'invalid',color:'redBright'},{name:'disposable',color:'orangeLight2'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const BB=[{name:'verifying',color:'blueBright'},{name:'deliverable',color:'greenBright'},{name:'undeliverable',color:'redBright'},{name:'risky',color:'yellowBright'},{name:'unknown',color:'grayBright'},{name:'error',color:'orangeBright'},{name:'skipped',color:'grayLight2'}];
const STc=[{name:'done',color:'greenBright'},{name:'verifying',color:'blueBright'},{name:'no_email_found',color:'redBright'},{name:'error',color:'orangeBright'}];
const EMP=[{name:'1-10'},{name:'11-50'},{name:'51-200'},{name:'201-500'},{name:'501-1000'},{name:'1001-5000'},{name:'5001-10000'},{name:'10001+'}];
const fields = [
  t('Domain'), t('Company'), t('public_emails_clean'), t('Industry Groups'), sel('Employees', EMP),
  t('City'), t('State'), t('Country'), t('Description'), t('Plan'),
  num('Revenue Est Monthly',0), num('Store Age Years',1), num('Product Count',0), num('App Spend Mo',0),
  t('Key Apps'), t('Tech Stack'), num('Trustpilot Rating',1), num('Trustpilot Reviews',0),
  t('Migrated From'), t('Social Followers'), t('Features'),
  t('segment'), t('Contact Source'), t('Tag'),
  sel('MV P0', MV), sel('BB', BB), t('Final Email'), sel('Status', STc)
];
// `Build Date` is a computed field, never a writable column, so nothing can overwrite a
// row's first-build date. It lives in `formulaFields` because Airtable rejects computed
// fields inside a create-table call; `Table Router` routes these to be added after the
// table exists. `Run ID` is retired: it recorded the last run, not the first build.
// `Tag` is the Operator's optional launch label, written onto every row of the build.
// 2026-08-12 Operator ruling: company_clean retired (the cleaned name lives in Company itself);
// 'Contact Source' replaces 'Source' for record provenance. 'Email Source' (waterfall tier) is
// owned by the verification lane, which creates it on first touch.
const formulaFields = [{ name: 'Build Date', type: 'formula', options: { formula: 'CREATED_TIME()' } }];
const desiredName = (g.buildName || 'List') + ' - Domains';
return [{ json: { mode: g.mode, existingTableId: g.existingTableId, buildNameIgnored: !!g.buildNameIgnored, desiredName, fields, formulaFields } }];