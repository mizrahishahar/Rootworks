// One loud run-log row when the daily feed refuses campaigns; silence when there was simply
// nothing to feed. A refused feed deploys nothing, so the error must be impossible to miss.
const bad=$input.all().map(i=>i.json).filter(j=>j&&j.ok===false&&!j._none);
if(!bad.length) return [];
const lines=bad.map(b=>'- '+(b.campaign||'?')+': '+(b.why||''));
return [{json:{
 'Automation':'Deploy View to Campaign',
 'Status':'Failed',
 'Run at':$now.toISO(),
 'Trigger':'schedule',
 'Errors':bad.length,
 'Execution ID':String($execution.id),
 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description':'**Daily feed refused '+bad.length+' campaign(s), nothing deployed for them**\n'+lines.join('\n')
}}];
