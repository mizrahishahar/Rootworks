const n=$('Normalize').first().json;
const f=$('Flatten').first().json;
const cv=$('Client Vars').first().json;
let prospectId='';
try{prospectId=$('Create CRM Prospect').first().json.id||'';}catch(e){}
let verdictWritten=false;
try{const v=$('Set CRM Verdict').first().json; if(v&&v.id){verdictWritten=true;}}catch(e){}
let clientRec='';
try{clientRec=$('Get Client Row').first().json.id||'';}catch(e){}
const name=(n.full_name||'').trim();
const verdict=f.custom_qualification_status||'unknown';
const desc=[
'Qualify & Notify New Lead run',
'- Lead: '+(name?name+' ':'')+'<'+(n.lead_email||'')+'>'+(n.job_title?', '+n.job_title:''),
'- Company: '+(f.company_name||n.company_name||'unknown')+(n.domain?' ('+n.domain+')':''),
'- Source: PlusVibe campaign '+(n.campaign_id||'unknown')+(n.is_freemail?' (freemail address)':''),
'- Verdict: '+verdict+(f.recommended_action?' | Recommended: '+f.recommended_action:''),
'- CRM: Prospects row created'+(prospectId?' ('+prospectId+')':'')+', contact row + qualification brief written',
'- Pipeline: '+(verdictWritten?('set from verdict "'+verdict+'" (Positive Reply / Disqualified)'):'not written'),
'- Slack: qualification brief posted to client channel '+(cv.slackChannel||'')
].join('\n');
return [{json:{
 'Automation':'Qualify & Notify New Lead',
 'Client': clientRec?[clientRec]:[cv.clientName||''],
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': 1,
 'Records Out': 1,
 'Errors': 0,
 'Target': n.lead_email||'',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];