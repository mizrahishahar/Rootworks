// One-off backfill of an Intent table. Body: { client, base, table, datasetIds: [...] }.
// client = Hub Clients record id (for the log row), base/table = the Intent table,
// datasetIds = the Apify datasets still retrievable (Apify keeps roughly ten days).
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const b=($input.first().json||{}).body||{};
const list=(v)=>Array.isArray(v)?v.map(String):String(v||'').split(',').map(s=>s.trim()).filter(Boolean);
const cfg={ client:String(b.client||''), base:String(b.base||''), table:String(b.table||''), datasetIds:list(b.datasetIds) };
const missing=[];
if(!cfg.client) missing.push('client'); if(!cfg.base) missing.push('base'); if(!cfg.table) missing.push('table');
if(missing.length) throw new Error('Backfill launch missing: '+missing.join(', '));
return [{ json: cfg }];
