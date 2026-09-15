// Sync Summary: the last node. This sync runs inside the Campaigns Manager and writes no Hub row of
// its own; this one item is what the manager reads and rolls into its row. problems[] is what the
// manager counts as errors; skips are named separately and never counted.
let results=[]; let rs=0; let launch={}; let scope='all Email Bison clients';
try{ const sd=$getWorkflowStaticData('global'); results=sd.pvSyncResults||[]; rs=sd.runStartedAt||0; launch=sd.launch||{}; scope=sd.syncScope||scope; }catch(e){}
const failed=results.filter(r=>!r.ok);
const totalIn=results.reduce((s,r)=>s+(r.campaigns||0),0);
const totalOut=results.reduce((s,r)=>s+(r.written||0),0);
const problems=failed.map(r=>r.client+': campaigns seen but none written');
const skips=[];
if(launch.clientFilter && !results.length) skips.push('client filter matched no Email Bison client');
return [{ json: {
 _sync: 'Sync Email Bison Campaigns to Hub',
 scope,
 clients: results.length,
 in: totalIn,
 out: totalOut,
 threadsChecked: 0,
 threadsUpdated: 0,
 problems,
 skips,
 seconds: Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
}}];
