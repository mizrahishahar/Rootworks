const sd=$getWorkflowStaticData('global');
const launch=sd.launch||{};
const results=sd.syncResults||[];
const totalInboxes=results.reduce((s,r)=>s+(r.inboxes||0),0);
const totalWritten=results.reduce((s,r)=>s+(r.written||0),0);
const totalFailed=results.reduce((s,r)=>s+(r.failed||0),0);
const lines=results.map(r=>'- **'+r.client+':** '+r.inboxes+' inboxes, '+r.written+' written'+(r.failed?', '+r.failed+' pull failure(s)':'')+(r.ok?'':' (WRITE MISMATCH)'));
const parts=['**'+results.length+' client(s), '+totalInboxes+' inbox(es), '+totalFailed+' pull failure(s)**','**Scope:** '+(sd.syncScope||'all clients')].concat(lines);
if(launch.clientFilter && !results.length) parts.push('**Skipped (1, client filter matched no PlusVibe client)**');
const row={
  'Automation':'Sync PlusVibe Inboxes to Hub',
  'Status': totalFailed>0? 'Succeeded with errors':'Succeeded',
  'Run at': $now.toISO(),
  'Records In': totalInboxes,
  'Records Out': totalWritten,
  'Errors': totalFailed,
  'Target': 'Inboxes',
  'Trigger': launch.trigger||'schedule',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Duration s': Math.round(($now.toMillis()-(launch.startedAt||$now.toMillis()))/1000),
  'Description': parts.join('\n')
};
// Client is attached only when the run served exactly one client; never an empty link array.
if(launch.clientFilter) row['Client']=[launch.clientFilter];
return [{ json: row }];
