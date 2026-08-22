// Closes the Hub launch row of an on-demand run with a roll-up of the per-client rows.
// A scheduled run has no launch row and this leg emits nothing.
const sd=$getWorkflowStaticData('global');
const launch=sd.launch||{};
if(!launch.recordId) return [];
const rs=sd.runStartedAt||launch.startedAt||$now.toMillis();
const results=sd.intentResults||[];
const ready=results.reduce((s,r)=>s+(r.ready||0),0);
const enrolled=results.reduce((s,r)=>s+(r.enrolled||0),0);
const failed=results.reduce((s,r)=>s+(r.failed||0),0);
const lines=results.map(r=>'- **'+(r.client||'?')+':** '+(r.ready||0)+' ready · '+(r.enrolled||0)+' enrolled · '+(r.failed||0)+' failed');
const parts=['**'+results.length+' client(s), '+ready+' ready, '+enrolled+' enrolled, '+failed+' failed**','**Scope:** '+(sd.syncScope||'all clients')];
if(lines.length) parts.push('**Clients** (one detail row per client below this one)\n'+lines.join('\n'));
if(launch.clientFilter && !results.length) parts.push('**Skipped (1, client filter matched no Intent client)**');
const row={
  'Automation': $workflow.name,
  'Status': failed?'Succeeded with errors':'Succeeded',
  'Run at': $now.toISO(),
  'Records In': ready,
  'Records Out': enrolled,
  'Errors': failed,
  'Target': results.map(r=>r.target||'').filter(Boolean).join(', '),
  'Trigger': 'form',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Duration s': Math.round(($now.toMillis()-rs)/1000),
  'Description': parts.join('\n\n')
};
if(launch.clientFilter) row['Client']=[launch.clientFilter];
return [{json:row}];
