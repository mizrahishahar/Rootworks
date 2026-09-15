// Sync Summary: the last node. This sync runs inside the Campaigns Manager and writes no Hub row of
// its own; this one item is what the manager reads and rolls into its row. problems[] is what the
// manager counts as errors; skips are named separately and never counted.
let results=[]; let t={checked:0,updated:0,problems:[]}; let rs=0; let launch={}; let scope='all clients';
try{ const sd=$getWorkflowStaticData('global'); results=sd.pvSyncResults||[]; t=sd.threadStats||t; rs=sd.runStartedAt||0; launch=sd.launch||{}; scope=sd.syncScope||scope; }catch(e){}
const failed=results.filter(r=>!r.ok);
const totalIn=results.reduce((s,r)=>s+(r.campaigns||0),0);
const totalOut=results.reduce((s,r)=>s+(r.written||0),0);
const allProbs=t.problems||[];
const skipped=allProbs.filter(p=>String(p).includes('no email'));
const probs=allProbs.filter(p=>!String(p).includes('no email'));
const problems=failed.map(r=>r.client+': campaigns seen but none written').concat(probs.map(p=>String(p)));
const skips=[];
if(skipped.length) skips.push(skipped.length+' prospect(s) without a contact email');
if(t.scopeSkipped) skips.push(t.scopeSkipped+' prospect(s) of a client outside this run\'s scope');
if(launch.clientFilter && !results.length) skips.push('client filter matched no PlusVibe client');
return [{ json: {
 _sync: 'Sync PlusVibe Campaigns to Hub',
 scope,
 clients: results.length,
 in: totalIn,
 out: totalOut,
 threadsChecked: t.checked||0,
 threadsUpdated: t.updated||0,
 problems,
 skips,
 seconds: Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
}}];
