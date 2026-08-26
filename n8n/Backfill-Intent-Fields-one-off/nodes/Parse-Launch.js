// One-off backfill of an Intent table. Body:
//   { client, base, table, datasetIds: [...], roles: [...], passes: [...], email_campaign }
// client = Hub Clients record id (for the log row); base/table = the Intent table;
// datasetIds = Apify datasets still retrievable (jobs pass); roles = the play's roles line (role pass);
// passes = which fills to run, any of: jobs, company, contacts, role, campaigns, liurl, arkurl.
// Default: all except liurl and arkurl.
// liurl (ruling 2026-08-25, first pass): mismatched URLs re-derived from DiscoLike or blanked.
// arkurl (ruling 2026-08-25, second pass): AI-Ark is the LinkedIn identity authority. Looks the
// person up by name + domain and writes their canonical profile URL. arkurl_scope on the body:
// 'blanked' (default) = Supersoniq rows with an empty URL (restores contacts lost to the guard);
// 'all-supersoniq' = every Supersoniq row, verifying and replacing standing URLs too.
// email_campaign = PlusVibe campaign id written as Email Campaign where blank (campaigns pass).
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const b=($input.first().json||{}).body||{};
const list=(v)=>Array.isArray(v)?v.map(String):String(v||'').split(',').map(s=>s.trim()).filter(Boolean);
const passes=list(b.passes); const all=!passes.length;
const cfg={ client:String(b.client||''), base:String(b.base||''), table:String(b.table||''), datasetIds:list(b.datasetIds), roles:list(b.roles), email_campaign:String(b.email_campaign||''),
  arkurl_scope:String(b.arkurl_scope||'blanked'),
  do:{ jobs: all||passes.includes('jobs'), company: all||passes.includes('company'), contacts: all||passes.includes('contacts'), role: all||passes.includes('role'), campaigns: all||passes.includes('campaigns'), liurl: passes.includes('liurl'), arkurl: passes.includes('arkurl') } };
const missing=[];
if(!cfg.client) missing.push('client'); if(!cfg.base) missing.push('base'); if(!cfg.table) missing.push('table');
if(cfg.do.role&&!cfg.roles.length) missing.push('roles (needed for the role pass)');
if(missing.length) throw new Error('Backfill launch missing: '+missing.join(', '));
return [{ json: cfg }];
