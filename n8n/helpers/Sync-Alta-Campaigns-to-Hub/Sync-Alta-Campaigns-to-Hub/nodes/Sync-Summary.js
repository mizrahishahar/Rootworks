// Sync Summary: the last node. This sync runs inside the Campaigns Manager and writes no Hub row of
// its own; this one item is what the manager reads and rolls into its row. problems[] is what the
// manager counts as errors. This machine serves the one Alta workspace (Dave.io); a client filter
// on the run is noted as a skip, never applied.
let s={totalInWorkspace:0,truncated:false,campaigns:[]};
let t={checked:0,updated:0,skipped:[]};
let rs=0; let launch={};
try{ const sd=$getWorkflowStaticData('global'); s=sd.altaSync||s; t=sd.altaThreads||t; rs=sd.runStartedAt||0; launch=sd.launch||{}; }catch(e){}
const problems=t.skipped.map(p=>String(p));
if(s.truncated) problems.push('workspace has >100 campaigns, list truncated');
if(s.totalInWorkspace>0 && s.campaigns.length===0) problems.push('0 campaigns upserted while workspace has '+s.totalInWorkspace+' campaign(s)');
const skips=[];
if(launch.clientFilter && launch.clientFilter!=='reclCOYRBgMowJd8G') skips.push('run scoped to another client; this sync serves the Dave.io Alta workspace only');
return [{ json: {
 _sync: 'Sync Alta Campaigns to Hub',
 scope: 'the Dave.io Alta workspace',
 clients: 1,
 in: s.totalInWorkspace||0,
 out: s.campaigns.length,
 threadsChecked: t.checked||0,
 threadsUpdated: t.updated||0,
 problems,
 skips,
 seconds: Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
}}];
