// Build Log: one row per run on the launch row, status computed from failed[], skips
// separated from errors, Client attached (a launched run serves exactly one client).
// Records Out is what the helper's upserts returned record ids for, never the pre-write count.
// The table, the columns created and the keys dropped come from the preflight call (Check
// Base); the batch totals from the loop state.
const p=$('Launch Params').first().json;
let cfg={}; try{ cfg=$('Check Base').first().json||{}; }catch(e){}
const sd=$getWorkflowStaticData('global');
const st=(sd.slBatchState)||{};
const t=Object.assign({ pulled:0, kept:0, upserted:0, withEmails:0, failed:0, skipped:0, inactive:0, duplicate:0, dnc:0 }, st.totals||{});
const failed=[];
for(const r of (st.failReasons||[])) failed.push({ name:'upsert', reason:String(r).slice(0,120) });
const errors=Number(t.failed)||0;
if(errors>failed.length) failed.push({ name:'upsert', reason:(errors-failed.length)+' more rows returned no record id' });
let fired=false; try{ fired=$('Fire Contacts').all().length>0; }catch(e){}
let queries=[]; try{ queries=$('Build SL Query').all().map(i=>i.json||{}); }catch(e){}
const providers=Array.from(new Set(queries.map(q=>q._provider).filter(Boolean)));
const countries=Array.from(new Set(queries.map(q=>q._country).filter(Boolean)));
const SKIP=new Set(['page_size','sort','fields','f:cc']);
const filters=Object.entries((queries[0]||{}).pullQuery||{}).filter(([k])=>!SKIP.has(k)).map(([k,v])=>k+'='+v).join(', ');
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const fmt=v=>Number(v||0).toLocaleString('en-US');
const tableName=cfg.tableName||'Companies';
const lines=[
  '**'+fmt(t.pulled)+' stores pulled, '+fmt(t.upserted)+' landed on '+tableName+'**',
  '',
  '**Source:** Storeleads, providers '+(providers.join(', ')||'all')+', countries '+(countries.join(', ')||'ALL')+', cap '+fmt(st.cap||p.maxCompanies),
  '**Filters:** '+(filters||'none'),
  '**Tag:** '+(p.tag||'none'),
  '',
  '**Funnel**',
  '- **Pulled:** '+fmt(t.pulled),
  '- **Kept (active, unique domain, under the cap):** '+fmt(t.kept),
  '- **Landed (record id returned):** '+fmt(t.upserted),
  '- **With public emails:** '+fmt(t.withEmails),
  '- **Without public emails:** '+fmt(Math.max(0,t.upserted-t.withEmails))
];
if(Array.isArray(cfg.createdColumns)&&cfg.createdColumns.length) lines.push('- **Columns created (open fields):** '+cfg.createdColumns.join(', '));
if(Array.isArray(cfg.droppedKeys)&&cfg.droppedKeys.length) lines.push('- **Keys dropped:** '+cfg.droppedKeys.map(d=>d.key+' ('+d.why+')').join(', '));
lines.push('', '**Contacts:** '+(fired?'Waterfall Contacts fired on view "Not Sourced" (all three sources, Max companies 5000); it writes its own row':'not fired, nothing landed'));
const skips=[]; if(t.skipped) skips.push(fmt(t.skipped)+' empty domain'); if(t.inactive) skips.push(fmt(t.inactive)+' inactive store'); if(t.duplicate) skips.push(fmt(t.duplicate)+' duplicate domain in the pull'); if(t.dnc) skips.push(fmt(t.dnc)+' on the DNC table');
if(skips.length) lines.push('', '**Skipped ('+skips.join(', ')+')**');
if(failed.length){ lines.push('', '**Failures**'); for(const f of failed.slice(0,10)) lines.push('- '+f.name+': '+f.reason); }
const log={
  'Automation':'Insert Storeleads domains to Clayroots',
  'Status': errors?'Succeeded with errors':'Succeeded',
  'Trigger':'form',
  'Errors': errors,
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
