const g = $('Launch Guard').first().json;
const t = (n) => ({ name: n, type: 'singleLineText' });
const sel = (n, ch) => ({ name: n, type: 'singleSelect', options: { choices: ch.map(c=>({ name: c })) } });
const fields = [
  t('Name'), t('Contact Key'), t('first_name'), t('last_name'), t('Title'),
  sel('Seniority', ['C-Suite','Founder','Owner','President','Executive','VP','Head','Director','Manager','Senior','Partner','EVP / SVP','Board / Chair','Unclassified']),
  sel('Department', ['Executive','Engineering','Technology','R&D','Product','Data','Security','Design','Operations','Sales','Marketing','Finance','Human Resources','Customer Success','Project Management','Strategy','Legal','Supply Chain','Communications','Community & Social','Compliance & GRC']),
  t('Email'), t('Social'), t('Phone'), t('Connections'), t('Domain'), t('Company'), t('Industry Groups'),
  sel('Employees', ['1-10','11-50','51-200','201-500','501-1000','1001-5000','5001-10000','10001+']),
  t('Business Model'), t('MX Provider'),
  t('Description'), t('Keywords'), t('City'), t('State'), t('Country'), t('Zip'), t('Street'),
  sel('Contact Source', ['ContaGen','Supersoniq']),
  t('Tag')
];

const coreNames = new Set(fields.map(f => f.name));
// Operator ruling 2026-08-12. These never enter a contacts table, by contract or by CSV header.
// company_clean: cleaning happens on Company itself. State Full: State is the only location column.
// Valid / Start Date / Redirect Domain / Update Date: CSV noise, they were never contract entries.
// Seniority Rank, Run ID, Build Date, Source, MV: owned elsewhere or retired.
// Extra CSV columns are still welcome. This list is the standard, not a lock.
const skip = new Set(['domain','company_domain','Verified','segment','query_name','ingested_at','RankInCompany',
  'company_clean','State Full','Score','Similarity','Valid','Start Date','Redirect Domain','Update Date',
  'Run ID','Seniority Rank','Build Date','Source','MV','Tag']);
const seenExtra = new Set();
const csvRows = $('Read CSV').all().map(i => i.json);
for (const r of csvRows) {
  for (const k of Object.keys(r)) {
    if (coreNames.has(k) || skip.has(k) || seenExtra.has(k)) continue;
    seenExtra.add(k);
    fields.push(t(k));
  }
}

const formulaFields = [
  { name: 'Build Date', type: 'formula', options: { formula: 'CREATED_TIME()' } }
];
const desiredName = (g.buildName || 'List') + ' - Contacts';
return [{ json: { mode: g.mode, existingTableId: g.existingTableId, buildNameIgnored: !!g.buildNameIgnored, desiredName, fields, formulaFields } }];