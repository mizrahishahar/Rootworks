// Preflight: the helper's rows-less call (Insert domains to Clayroots), before the first
// metered Storeleads page. One item carrying only _meta, with keys = the row keys Process Batch
// (SL Batch Pull) writes: the helper's Check Columns refuses when the landing fields or the
// Storeleads declared extras are missing on Companies (they are register fields, never created
// here: scaffold the base with Extras = Storeleads), and creates any open key once for the run.
// The batches then call the same helper with rows and allowNew off.
const p=$('Launch Params').first().json;
const KEYS=['Domain','Company','Description','Industry Groups','Employees','Country','State','City','Public Emails','public_emails_clean','MX Provider','Plan','Revenue Est Monthly','Store Age Years','Product Count','App Spend Mo','Key Apps','Tech Stack','Trustpilot Rating','Trustpilot Reviews','Migrated From','Social Followers','Features'];
return [{ json: { _meta: { base: p.base, clientRecId: p.clientRecId, tag: p.tag||'', domainSource: 'Storeleads', allowNew: true, keys: KEYS } } }];
