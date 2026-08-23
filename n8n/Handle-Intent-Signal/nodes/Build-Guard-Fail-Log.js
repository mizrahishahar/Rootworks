// Head guard tripped: the payload is missing something required. One error, nothing paid.
// 'Failed' is the Error Logger's word for a crash; a guard trip is Succeeded with errors.
const cfg=$('Parse Config').first().json||{};
const missing=(cfg.missing||[]).join(', ')||'unknown';
const row={
 'Automation':'Handle Intent Signal',
 'Status':'Succeeded with errors',
 'Run at': $now.toISO(),
 'Records In': 0,
 'Records Out': 0,
 'Errors': 1,
 'Target': cfg.table||'(no table)',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': '**Head guard tripped before any paid call, 1 error**\n\n**Missing/invalid params:** '+missing+'\n\n**Required on the Apify webhook payload:** client, table, campaign (URL), resource (carries the dataset id). Fix the payload template on the Apify task and rerun.'
};
if(cfg.client) row['Client']=[cfg.client];
return [{json:row}];
