// Build Run Log: this booking's row on the Hub Automations table.
// Status is computed, never a literal (the logging standard, and the pattern Sync Meeting
// Summaries to Vault already uses): the same three facts the Description narrates are counted
// into failed[], Errors = failed.length, and a discovery whose Meetings row never landed logs
// "Succeeded with errors" instead of green. Resolve Prospect always returns a row, matched or
// created, so a missing prospect id is a failure here, not the no-match skip it is in the
// summaries sync.
let v={};
try{v=$('Extract & normalize').first().json||{};}catch(e){}
let existed=false, prospectId='';
try{const r=$('Resolve Prospect').first().json; existed=!!r.existed; prospectId=r.prospect_id||'';}catch(e){}
let meetingId='';
try{meetingId=$('Create Meeting').first().json.id||'';}catch(e){}
let statusWritten=false;
try{const u=$('Set Scheduled Call').first().json; if(u&&u.id){statusWritten=true;}}catch(e){}
const failed=[];
if(!prospectId) failed.push('prospect row neither matched nor created');
if(!meetingId) failed.push('meeting row not created');
if(prospectId&&!statusWritten) failed.push('prospect status not written (PipelineStatus, contextNotes)');
const status=failed.length?'Succeeded with errors':'Succeeded';
const who=((v.firstName||'')+' '+(v.lastName||'')).trim();
const prospectUrl=prospectId?('https://airtable.com/appQG6dK0FIOhTxOl/tblEPFCO0kJn2tMyK/'+prospectId):'';
let desc=[
'Handle New Discovery run (Cal.com discovery booking -> Airtable CRM)',
'- Meeting: '+(v.title||'(untitled)')+' at '+(v.startTime||'(unknown time)'),
'- Attendee: '+(who?who+' ':'')+'<'+(v.email||'')+'>'+(v.domain?' ('+v.domain+')':''),
'- Prospect: '+(prospectId?((existed?'matched existing row':'created new row')+(prospectUrl?' '+prospectUrl:'')):'NOT resolved'),
'- Meetings row: '+(meetingId?'created ('+meetingId+') with Title/Date/Participants/MeetingLink, linked to Company':'not created'),
'- Pipeline: '+(statusWritten?'PipelineStatus set to Scheduled Call, contextNotes updated':'not written'),
'- Booking UID: '+(v.bookingUid||'(none)')+(v.meetingUrl?' | video: '+v.meetingUrl:''),
(v.notes?'- Booking notes: '+String(v.notes).slice(0,300):'- Booking notes: (none)')
].join('\n');
if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
return [{json:{
 'Automation':'Handle New Discovery',
 'Client': ['recl27rmyOlVg7fxb'],
 'Status':status,
 'Run at': $now.toISO(),
 'Records In': 1,
 'Records Out': 1,
 'Errors': failed.length,
 'Target': v.title||v.email||'',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];
