const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
let clientRec='';
try{clientRec=$('Get Client Row').first().json.id||'';}catch(e){}
let bdrMsgs=0, bdrThreads=0;
try{const items=$('BDR Attach').all().map(i=>i.json); bdrMsgs=items.length; bdrThreads=items.filter(x=>x.msg&&(x.msg.replies||[]).length>0).length;}catch(e){}
let filename='', fileId='';
try{filename=$('Format BDR File').first().json.filename||'';}catch(e){}
try{fileId=$('Create BDR Log File').first().json.id||'';}catch(e){}
let prospectMatched=false;
try{prospectMatched=$('Attach Card').all().some(i=>i.json&&i.json.record_id);}catch(e){}
let crmComments=0;
try{crmComments=$('Diff New Replies').all().filter(i=>i.json&&i.json.record_id).length;}catch(e){}
const failed=[];
if(!fileId) failed.push('log file not written to Drive');
const status=failed.length?'Succeeded with errors':'Succeeded';
let desc=[
'**'+bdrMsgs+' messages, '+bdrThreads+' with threads, '+crmComments+' CRM comments**',
'',
'- **Fired by:** Sync Slack Logs',
'- **Channel synced:** C0AQ013Q8FN (moveplnr-bdr)',
'- **Pulled:** '+bdrMsgs+' message(s), '+bdrThreads+' with threads',
'- **File:** '+(fileId?((filename||'(unnamed)')+' (Drive id '+fileId+') in the client Logs folder'):'NOT written ('+(filename||'no file')+')'),
'- **CRM:** '+(prospectMatched?(crmComments+' new BDR thread repl(ies) pushed as Hub Prospects record comments'):'no prospect matched, no comments pushed'),
'- **Window:** '+$now.minus({hours:24}).toISO()+' to '+$now.toISO()
].join('\n');
if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
return [{json:{
 'Automation':'Sync BDR channel for moveplnr',
 'Client': clientRec?[clientRec]:['Move PLNR'],
 'Status':status,
 'Run at': $now.toISO(),
 'Records In': bdrMsgs,
 'Records Out': (fileId?1:0)+crmComments,
 'Errors': failed.length,
 'Target': 'C0AQ013Q8FN -> '+(filename||'')+' + Prospect comments',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
}}];