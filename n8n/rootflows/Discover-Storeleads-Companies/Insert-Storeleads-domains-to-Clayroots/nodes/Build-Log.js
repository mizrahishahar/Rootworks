// Build Log: one row per run, on the launch row, status computed from the batches' failures and the
// provider verdict, skips separated from errors, Client attached (a launched run serves exactly one
// client). Records Out is what the helper's upserts returned record ids for, never the pre-write
// count. The table, the columns created and the keys dropped come from the preflight call (Check
// Base); the funnel from the loop's counters.
// A Storeleads that could not be reached (no credential, dead API, error pages twice) is a logged
// skip, never a crash: the row closes Failed only when nothing at all could be pulled.
const p=$('Launch Params').first().json;
let cfg={}; try{ cfg=$('Check Base').first().json||{}; }catch(e){}
const sd=$getWorkflowStaticData('global');
const st=(sd.slBatchState)||{};
const t=Object.assign({ pulled:0, kept:0, upserted:0, newDomains:0, existingDomains:0, withEmails:0, failed:0, skipped:0, inactive:0, duplicate:0, dnc:0 }, st.totals||{});
const failed=[];
for(const r of (st.failReasons||[])) failed.push({ name:'upsert', reason:String(r).slice(0,140) });
const errors=Number(t.failed)||0;
if(errors>failed.length) failed.push({ name:'upsert', reason:(errors-failed.length)+' more rows returned no record id' });
const providerErrors=Number(st.providerErrors)||0;
const providerDown=!t.pulled&&providerErrors>0;
if(providerDown) failed.push({ name:'Storeleads', reason:'Storeleads could not be pulled: '+(st.providerReason||'error pages only') });
let fired=false, scope=0; try{ const fc=$('Fire Contacts').first().json||{}; fired=true; scope=(fc.Domains||[]).length; }catch(e){}
let queries=[]; try{ queries=$('Build SL Query').all().map(i=>i.json||{}); }catch(e){}
const providers=Array.from(new Set(queries.map(q=>q._provider).filter(Boolean)));
const countries=Array.from(new Set(queries.map(q=>q._country).filter(Boolean)));
const SKIP=new Set(['page_size','sort','fields','f:cc']);
const filters=Object.entries((queries[0]||{}).pullQuery||{}).filter(([k])=>!SKIP.has(k)).map(([k,v])=>k+'='+v).join(', ');
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const fmt=v=>Number(v||0).toLocaleString('en-US');
const tableName=cfg.tableName||'Companies';
const lines=[
  '**'+fmt(t.pulled)+' stores pulled, '+fmt(t.upserted)+' landed on '+tableName+' ('+fmt(t.newDomains)+' new, '+fmt(t.existingDomains)+' already held and refreshed)**',
  '',
  '**Source:** Storeleads, providers '+(providers.join(', ')||'all')+', countries '+(countries.join(', ')||'ALL')+', cap '+fmt(st.cap||p.maxCompanies),
  '**Filters:** '+(filters||'none'),
  '**Tag:** '+(p.tag||'none'),
  '**Rule:** every active store the search answers is landed on Domain; a held company is refreshed with the new pull (Domain Source kept, Tag re-stamped); DNC domains dropped',
  '',
  '**Funnel**',
  '- **Pulled:** '+fmt(t.pulled),
  '- **Kept (active, unique domain, under the cap):** '+fmt(t.kept),
  '- **Landed (record id returned):** '+fmt(t.upserted)+' ('+fmt(t.newDomains)+' new, '+fmt(t.existingDomains)+' already held)',
  '- **With public emails:** '+fmt(t.withEmails),
  '- **Without public emails:** '+fmt(Math.max(0,t.upserted-t.withEmails)),
  '- **Batches:** '+fmt(st.batchNum)
];
if(Array.isArray(cfg.createdColumns)&&cfg.createdColumns.length) lines.push('- **Columns created (open fields):** '+cfg.createdColumns.join(', '));
if(Array.isArray(cfg.droppedKeys)&&cfg.droppedKeys.length) lines.push('- **Keys dropped:** '+cfg.droppedKeys.map(d=>d.key+' ('+d.why+')').join(', '));
lines.push('', '**Contacts:** '+(fired?('Enrich Contacts fired once on Companies view "Not Sourced"'+(scope?(', scoped to the '+fmt(scope)+' domains of this pull'):(st.scopeOverflow?', unscoped: this pull is past the '+fmt(st.scopeCap)+'-domain scope cap, so the whole view is worked':', unscoped'))+'; it writes its own launch row'):'not fired, nothing landed'));
const skips=[];
if(t.skipped) skips.push(fmt(t.skipped)+' empty domain');
if(t.inactive) skips.push(fmt(t.inactive)+' inactive store');
if(t.duplicate) skips.push(fmt(t.duplicate)+' duplicate domain in the pull');
if(t.dnc) skips.push(fmt(t.dnc)+' on the DNC table');
if(providerErrors&&t.pulled) skips.push(fmt(providerErrors)+' Storeleads page(s) failed ('+(st.providerReason||'no reason given')+')');
if(skips.length) lines.push('', '**Skipped ('+skips.join(', ')+')**');
if(st.stoppedWhy) lines.push('', '**Stopped early:** '+st.stoppedWhy);
if(failed.length){ lines.push('', '**Failures ('+failed.length+')**'); for(const f of failed.slice(0,10)) lines.push('- '+f.name+': '+f.reason); }
const log={
  'Automation':'Discover Storeleads Companies',
  'Status': providerDown?'Failed':(failed.length?'Succeeded with errors':'Succeeded'),
  'Trigger':'form',
  'Errors': failed.length,
  'Run at': $now.toISO(),
  'Target': tableName+' ('+(cfg.tableId||'')+')',
  'Records In': t.pulled,
  'Records Out': t.upserted,
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id),
  'Client': [p.clientRecId]
};
return [{ json: log }];
