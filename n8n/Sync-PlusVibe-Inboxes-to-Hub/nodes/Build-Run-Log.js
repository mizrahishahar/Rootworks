const sd=$getWorkflowStaticData('global');
const results=sd.syncResults||[];
const totalInboxes=results.reduce((s,r)=>s+(r.inboxes||0),0);
const totalWritten=results.reduce((s,r)=>s+(r.written||0),0);
const totalFailed=results.reduce((s,r)=>s+(r.failed||0),0);
const lines=results.map(r=>'- **'+r.client+':** '+r.inboxes+' inboxes, '+r.written+' written'+(r.failed?', '+r.failed+' pull failure(s)':'')+(r.ok?'':' (WRITE MISMATCH)'));
const desc=['**'+results.length+' client(s), '+totalInboxes+' inbox(es), '+totalFailed+' pull failure(s)**'].concat(lines).join('\n');
return [{ json: {
  'Automation':'Sync PlusVibe Inboxes to Hub',
  'Status': totalFailed>0? 'Succeeded with errors':'Succeeded',
  'Run at': $now.toISO(),
  'Records In': totalInboxes,
  'Records Out': totalWritten,
  'Errors': totalFailed,
  'Target': 'Inboxes',
  'Trigger':'schedule',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Description': desc
}}];