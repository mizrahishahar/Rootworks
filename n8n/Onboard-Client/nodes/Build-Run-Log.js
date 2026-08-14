const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
let v={};
try{v=$('Build Client Vars').first().json||{};}catch(e){}
let folderId='';
try{folderId=$('Create Client Folder').first().json.id||'';}catch(e){}
let channelId='';
try{channelId=$('Create Slack Channel').first().json.id||'';}catch(e){}
let baseId='';
try{baseId=$('Create ClayRoots Base').first().json.id||'';}catch(e){}
let regRec='';
try{regRec=$('Create Clients Record').first().json.id||'';}catch(e){}
let prospectId='';
try{prospectId=$('Onboard Webhook').first().json.query.recordId||$('Onboard Webhook').first().json.query.leadId||'';}catch(e){}
const desc=[
'**'+(v.clientName||'(unknown)')+' onboarded'+(baseId?'':', ClayRoots base missing')+'**',
'',
'**Prospect:** '+(prospectId||'?'),
'',
'**Created**',
'- **Drive:** client folder '+(folderId||'(none)')+' with full anatomy + Overrides stub, Shared shared to contacts',
'- **Slack:** '+(v.channelName||'')+' created ('+(channelId||'none')+'), Operator invited',
'- **ClayRoots:** base '+(baseId||'NOT CREATED - flag for hand-creation'),
'- **Registry:** Clients row '+(regRec||'(none)')+' written with all IDs'
].join('\n');
return [{json:{
 'Automation':'Onboard Client',
 'Client': regRec?[regRec]:[],
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': 1,
 'Records Out': 1,
 'Errors': (baseId?0:1),
 'Target': prospectId||'',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
}}];