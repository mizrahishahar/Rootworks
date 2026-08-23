// One-off backfill of an Intent table. Body:
//   { client, base, table, datasetIds: [...], kvStoreId, passes: [...] }
// client = Hub Clients record id (for the log row); base/table = the Intent table;
// datasetIds = Apify datasets still retrievable (jobs pass); kvStoreId = any run's key-value
// store of the same Apify task (its INPUT carries the scraped roles, for the in-role count);
// passes = which fills to run, any of: jobs, company, contacts, role. Default: all.
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const b=($input.first().json||{}).body||{};
const list=(v)=>Array.isArray(v)?v.map(String):String(v||'').split(',').map(s=>s.trim()).filter(Boolean);
const passes=list(b.passes); const all=!passes.length;
const cfg={ client:String(b.client||''), base:String(b.base||''), table:String(b.table||''), datasetIds:list(b.datasetIds), kvStoreId:String(b.kvStoreId||''),
  do:{ jobs: all||passes.includes('jobs'), company: all||passes.includes('company'), contacts: all||passes.includes('contacts'), role: all||passes.includes('role') } };
const missing=[];
if(!cfg.client) missing.push('client'); if(!cfg.base) missing.push('base'); if(!cfg.table) missing.push('table');
if(cfg.do.role&&!cfg.kvStoreId) missing.push('kvStoreId (needed for the role pass)');
if(missing.length) throw new Error('Backfill launch missing: '+missing.join(', '));
return [{ json: cfg }];
