let s={checked:0,updated:0,problems:[]};
try{ const sd=$getWorkflowStaticData('global'); s=sd.threadSync||s; }catch(e){}
const probs=(s.problems||[]);
const desc=['Sync Conversation Threads run (PV leg)','- Prospects with contacts checked: '+s.checked,'- Threads refreshed from PlusVibe: '+s.updated,'- Prospects with no PV thread (Alta/manual/non-PV) left untouched'].concat(probs.length?['- Problems: '+probs.join(' | ')]:[]).join('\n');
return [{ json: {
 'Automation':'Sync Conversation Threads',
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': s.checked,
 'Records Out': s.updated,
 'Errors': probs.length,
 'Target': 'Prospects',
 'Trigger':'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];