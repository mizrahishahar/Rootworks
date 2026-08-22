let results=[]; let rs=0; let launch={}; let scope='all clients';
try{ const sd=$getWorkflowStaticData('global'); results=sd.slackSyncResults||[]; rs=sd.runStartedAt||0; launch=sd.launch||{}; scope=sd.syncScope||scope; }catch(e){}
const failed=results.filter(r=>!r.ok);
const okOnes=results.filter(r=>r.ok);
const totalMsgs=results.reduce((s,r)=>s+(r.msgs||0),0);
const files=results.filter(r=>r.file).length;
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const lines=okOnes.map(r=> '- **'+r.client+' ('+(r.channel||'?')+'):** '+nf(r.msgs)+' msgs · '+(r.file?'file written':'no file'));
const parts=['**'+results.length+' client(s), '+failed.length+' failed**','**Scope:** '+scope];
if(lines.length) parts.push('**Clients**\n'+lines.join('\n'));
if(failed.length) parts.push('**FAILED ('+failed.length+')**\n'+failed.map(r=>'- '+r.client+' ('+(r.channel||'?')+'): '+(r.error||'unknown')).join('\n'));
if(launch.clientFilter && !results.length) parts.push('**Skipped (1, client filter matched no Slack-Sync client)**');
const desc=parts.join('\n\n');
const row={
 'Automation':'Sync Slack Logs to Vault',
 'Status': failed.length>0 ? 'Succeeded with errors' : 'Succeeded',
 'Run at': $now.toISO(),
 'Records In': totalMsgs,
 'Records Out': files,
 'Errors': failed.length,
 'Target': results.length+' client channel(s) -> Drive Logs folders',
 'Trigger': launch.trigger||'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
};
// Client is attached only when the run served exactly one client; never an empty link array.
if(launch.clientFilter) row['Client']=[launch.clientFilter];
return [{json: row}];
