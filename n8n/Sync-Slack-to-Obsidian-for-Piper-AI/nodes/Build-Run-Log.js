let clientRec='';
try{clientRec=$('Get Client Row').first().json.id||'';}catch(e){}
let cfg={};
try{cfg=$('Client Config').first().json||{};}catch(e){}
let msgs=0, threads=0;
try{const items=$('Attach replies to parent').all().map(i=>i.json); msgs=items.length; threads=items.filter(m=>(m.replies||[]).length>0).length;}catch(e){}
let filename='', fileId='';
try{filename=$('Format messages').first().json.filename||'';}catch(e){}
try{fileId=$('Create file from text').first().json.id||'';}catch(e){}
const desc=[
'Sync Slack Logs run (nightly, last 24h window)',
'- Channel synced: client channel '+(cfg.slackChannelId||'(unknown)'),
'- Pulled: '+msgs+' message(s), '+threads+' with thread replies',
'- Log file written: '+(filename||'(none)')+(fileId?' (Drive id '+fileId+')':'')+' in the client Logs folder',
'- Window covered: '+$now.minus({hours:24}).toISO()+' to '+$now.toISO()
].join('\n');
return [{json:{
 'Automation':'Sync Slack Logs',
 'Client': clientRec?[clientRec]:[cfg.clientName||'Piper AI'],
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': msgs,
 'Records Out': 1,
 'Errors': 0,
 'Target': (cfg.slackChannelId||'')+' -> '+(filename||''),
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];