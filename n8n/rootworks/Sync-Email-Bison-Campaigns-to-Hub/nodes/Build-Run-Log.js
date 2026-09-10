let results=[]; let rs=0; let launch={}; let scope='all Email Bison clients';
try{ const sd=$getWorkflowStaticData('global'); results=sd.pvSyncResults||[]; rs=sd.runStartedAt||0; launch=sd.launch||{}; scope=sd.syncScope||scope; }catch(e){}
const failed=results.filter(r=>!r.ok);
const totalIn=results.reduce((s,r)=>s+(r.campaigns||0),0);
const totalOut=results.reduce((s,r)=>s+(r.written||0),0);
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const lines=results.map(r=> '- **'+r.client+':** '+nf(r.campaigns)+' campaigns · '+nf(r.sent)+' sent · '+nf(r.replies)+' replies · '+nf(r.positives)+' interested'+(r.ok?'':' (FAILED)'));
const errCount=failed.length;
const parts=['**'+results.length+' client(s), '+failed.length+' failed**','**Scope:** '+scope];
if(lines.length) parts.push('**Clients**\n'+lines.join('\n'));
if(failed.length) parts.push('**FAILED ('+failed.length+')**\n'+failed.map(r=>'- '+r.client+': campaigns seen but none written').join('\n'));
if(launch.clientFilter && !results.length) parts.push('**Skipped (1, client filter matched no Email Bison client)**');
const desc=parts.join('\n\n');
const row={
 'Automation':'Sync Email Bison Campaigns to Hub',
 'Status': errCount>0 ? 'Succeeded with errors' : 'Succeeded',
 'Run at': $now.toISO(),
 'Records In': totalIn,
 'Records Out': totalOut,
 'Errors': errCount,
 'Target': 'Campaigns',
 'Trigger': launch.trigger||'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
};
// Client is attached only when the run served exactly one client; never an empty link array.
if(launch.clientFilter) row['Client']=[launch.clientFilter];
return [{ json: row }];
