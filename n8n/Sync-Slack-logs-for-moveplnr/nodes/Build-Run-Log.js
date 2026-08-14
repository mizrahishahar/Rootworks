let clientRec='';
try{clientRec=$('Get Client Row').first().json.id||'';}catch(e){}
let cfg={};
try{cfg=$('Client Config').first().json||{};}catch(e){}
let mainMsgs=0, mainThreads=0;
try{const items=$('Main Attach').all().map(i=>i.json); mainMsgs=items.length; mainThreads=items.filter(x=>x.msg&&(x.msg.replies||[]).length>0).length;}catch(e){}
let bdrMsgs=0, bdrThreads=0;
try{const items=$('BDR Attach').all().map(i=>i.json); bdrMsgs=items.length; bdrThreads=items.filter(x=>x.msg&&(x.msg.replies||[]).length>0).length;}catch(e){}
let filename='', fileId='';
try{filename=$('Format File').first().json.filename||'';}catch(e){}
try{fileId=$('Create Log File').first().json.id||'';}catch(e){}
let crmComments=0;
try{crmComments=$('Diff New Replies').all().filter(i=>i.json&&i.json.record_id).length;}catch(e){}
const totalIn=mainMsgs+bdrMsgs;
const desc=[
'Sync Slack Logs run (nightly, last 24h window)',
'- Channels synced: main client channel '+(cfg.slackChannelId||'(unknown)')+' + BDR channel C0AQ013Q8FN (moveplnr-bdr)',
'- Main channel: '+mainMsgs+' message(s), '+mainThreads+' with threads',
'- BDR channel: '+bdrMsgs+' message(s), '+bdrThreads+' with threads',
'- Log file written: '+(filename||'(none)')+(fileId?' (Drive id '+fileId+')':'')+' in the client Logs folder',
'- CRM: '+crmComments+' new BDR thread repl(ies) pushed as record comments on Hub Prospects rows',
'- Window covered: '+$now.minus({hours:24}).toISO()+' to '+$now.toISO()
].join('\n');
return [{json:{
 'Automation':'Sync Slack Logs',
 'Client': clientRec?[clientRec]:['Move PLNR'],
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': totalIn,
 'Records Out': 1,
 'Errors': 0,
 'Target': (cfg.slackChannelId||'')+' + C0AQ013Q8FN -> '+(filename||''),
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];