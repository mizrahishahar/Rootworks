// Fan Out Log: the schedule's own heartbeat row: which clients were fired. Each client run writes
// its own row keyed on its execution.
const fired=$('Fan Out').all().map(i=>i.json||{}).filter(j=>!j._empty);
const lines=['**Hourly sweep: '+fired.length+' client run'+(fired.length===1?'':'s')+' fired (each writes its own row)**','','**Scope:** every client with a Clayroots Base ID; each run reads People with Status = verifying'];
for(const f of fired) lines.push('- '+(f.client||f.clientRecId)+' ('+f.base+')');
if(!fired.length) lines.push('','**Skipped (no client carries a Clayroots Base ID)**');
return [{ json:{ 'Execution ID':String($execution.id), 'Automation':'Verify Catch-alls', 'Status':'Succeeded', 'Trigger':'schedule', 'Errors':0, 'Run at':new Date().toISOString(), 'Records In':fired.length, 'Records Out':fired.length, 'Description':lines.join('\n'), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id } }];
