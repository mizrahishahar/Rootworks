let s={checked:0,updated:0,skipped:[]};
try{ const sd=$getWorkflowStaticData('global'); s=sd.altaThreads||s; }catch(e){}
const desc=['Alta thread sync (MCP): '+s.checked+' prospects checked, '+s.updated+' threads refreshed'].concat(s.skipped.length?['Skipped: '+s.skipped.join('; ')]:[]).join('\n');
return [{ json: {
 'Automation':'Sync Conversation Threads',
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': s.checked,
 'Records Out': s.updated,
 'Errors': s.skipped.length,
 'Target': 'Prospects',
 'Trigger':'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];