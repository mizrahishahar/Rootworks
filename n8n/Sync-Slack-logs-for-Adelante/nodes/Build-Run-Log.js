let msgs=0, threads=0;
try{const items=$('Attach replies to parent').all().map(i=>i.json); msgs=items.length; threads=items.filter(m=>(m.replies||[]).length>0).length;}catch(e){}
let filename='', fileId='';
try{filename=$('Format messages').first().json.filename||'';}catch(e){}
try{fileId=$('Create log file').first().json.id||'';}catch(e){}
const desc=[
'Sync Slack Logs run (nightly 22:00, last 24h window)',
'- Channel synced: Adelante client channel C0BFHMGUHT3',
'- Pulled: '+msgs+' message(s), '+threads+' with thread replies',
'- Log file written: '+(filename||'(none)')+(fileId?' (Drive id '+fileId+')':'')+' in Clients/Adelante/Logs',
'- Window covered: '+$now.minus({hours:24}).toISO()+' to '+$now.toISO()
].join('\n');
return [{json:{
 'Automation':'Sync Slack Logs',
 'Client': ['recN79He6wwPKogUR'],
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': msgs,
 'Records Out': 1,
 'Errors': 0,
 'Target': 'C0BFHMGUHT3 -> '+(filename||''),
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];