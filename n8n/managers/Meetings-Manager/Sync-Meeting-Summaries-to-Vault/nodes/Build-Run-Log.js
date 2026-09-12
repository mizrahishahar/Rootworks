const sd2=$getWorkflowStaticData('global'); const rs=sd2.runStartedAt||0;
let v={};
try{v=$('Extract vars').first().json||{};}catch(e){}
let fileId='';
try{fileId=$('Create file from text').first().json.id||'';}catch(e){}
let prospectId='';
try{const f=$('Find Prospect').first().json; if(f&&f.id)prospectId=f.id;}catch(e){}
let meetingId='';
try{meetingId=$('Create Meeting').first().json.id||'';}catch(e){}
let statusWritten=false;
try{const u=$('Set Call Completed').first().json; if(u&&u.id){statusWritten=true;}}catch(e){}
const failed=[];
if(!fileId) failed.push('summary file not created');
if(!meetingId) failed.push('meeting row not created');
if(prospectId&&!statusWritten) failed.push('prospect status not written');
const status=failed.length?'Succeeded with errors':'Succeeded';
const title=v.meetingTitle||(v.filename||'').replace(/\.md$/,'');
const prospectUrl=prospectId?('https://airtable.com/appQG6dK0FIOhTxOl/tblEPFCO0kJn2tMyK/'+prospectId):'';
let desc=[
'**'+(title||'(unknown meeting)')+'**',
'',
'- **Meeting:** '+(title||'(unknown)')+' at '+(v.startTime||'(unknown time)')+' (Fathom -> Drive + Airtable CRM)',
'- **Participants:** '+(v.participants||'(none listed)'),
'- **External contact:** '+(v.externalEmail||'(none)'),
'- **Summary file:** '+(v.filename||'(none)')+(fileId?' (Drive id '+fileId+')':' NOT created')+' in the Flowroots meetings folder',
'- **Meetings row:** '+(meetingId?'created ('+meetingId+') with Title/Summary/Date/Participants/MeetingLink/RecordingLink':'not created'),
'- **Prospect:** '+(prospectId?('matched '+prospectUrl+(statusWritten?', PipelineStatus set to Call Completed':', status not written')):'no Flowroots prospect matched by domain, Company left empty'),
'- **Recording:** '+(v.recording||'(none)')
].join('\n');
if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
return [{json:{
 'Automation':'Sync Meeting Summaries to Vault',
 'Client': ['recl27rmyOlVg7fxb'],
 'Status':status,
 'Run at': $now.toISO(),
 'Records In': 1,
 'Records Out': 1,
 'Errors': failed.length,
 'Target': title||v.externalEmail||'',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
}}];