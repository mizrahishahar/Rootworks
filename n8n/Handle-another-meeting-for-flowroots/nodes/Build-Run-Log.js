let v={};
try{v=$('Extract & normalize').first().json||{};}catch(e){}
let existed=false, prospectId='';
try{const r=$('Resolve Prospect').first().json; existed=!!r.existed; prospectId=r.prospect_id||'';}catch(e){}
let meetingId='';
try{meetingId=$('Create Meeting').first().json.id||'';}catch(e){}
let statusWritten=false;
try{const u=$('Set Scheduled Call').first().json; if(u&&u.id){statusWritten=true;}}catch(e){}
const who=((v.firstName||'')+' '+(v.lastName||'')).trim();
const prospectUrl=prospectId?('https://airtable.com/appQG6dK0FIOhTxOl/tblEPFCO0kJn2tMyK/'+prospectId):'';
const desc=[
'Handle Another Meeting run (Cal.com booking -> Airtable CRM)',
'- Meeting: '+(v.title||'(untitled)')+' at '+(v.startTime||'(unknown time)'),
'- Attendee: '+(who?who+' ':'')+'<'+(v.email||'')+'>'+(v.domain?' ('+v.domain+')':''),
'- Prospect: '+(existed?'matched existing row':'created new row')+(prospectUrl?' '+prospectUrl:''),
'- Meetings row: '+(meetingId?'created ('+meetingId+') with Title/Date/Participants/MeetingLink, linked to Company':'not created'),
'- Pipeline: '+(statusWritten?'PipelineStatus set to Scheduled Call, contextNotes updated':'not written'),
'- Booking UID: '+(v.bookingUid||'(none)')+(v.meetingUrl?' | video: '+v.meetingUrl:''),
(v.notes?'- Booking notes: '+String(v.notes).slice(0,300):'- Booking notes: (none)')
].join('\n');
return [{json:{
 'Automation':'Handle Another Meeting',
 'Client': ['recl27rmyOlVg7fxb'],
 'Status':'Succeeded',
 'Run at': $now.toISO(),
 'Records In': 1,
 'Records Out': 1,
 'Errors': 0,
 'Target': v.title||v.email||'',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];