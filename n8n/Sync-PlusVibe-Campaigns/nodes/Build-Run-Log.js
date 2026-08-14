let results=[];
try{ const sd=$getWorkflowStaticData('global'); results=sd.pvSyncResults||[]; }catch(e){}
const failed=results.filter(r=>!r.ok);
const totalIn=results.reduce((s,r)=>s+(r.campaigns||0),0);
const totalOut=results.reduce((s,r)=>s+(r.written||0),0);
const lines=results.map(r=> r.client+': '+(r.campaigns||0)+' campaigns, '+(r.sent||0)+' sent, '+(r.replies||0)+' replies'+(r.ok?'':' (FAILED)'));
const desc=['Sync PlusVibe Campaigns run: '+results.length+' client(s), '+failed.length+' failed'].concat(lines).join('\n');
return [{ json: {
 'Automation':'Sync PlusVibe Campaigns',
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': totalIn,
 'Records Out': totalOut,
 'Errors': failed.length,
 'Target': 'Campaigns',
 'Trigger':'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];