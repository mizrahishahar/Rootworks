const cfg=$('Parse Config').first().json||{};
const missing=(cfg.missing||[]).join(', ')||'unknown';
return [{json:{
 'Automation':'Handle Intent Signal',
 'Client': cfg.client?[cfg.client]:[],
 'Status':'Failed',
 'Run at': $now.toISO(),
 'Records In': 0,
 'Records Out': 0,
 'Errors': 1,
 'Target': cfg.table||'(no table)',
 'Trigger':'event',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': '**Run FAILED, head guard tripped before any paid call**\n\n**Missing/invalid params:** '+missing+'\n\n**Required:** client, table, campaign (webhook body or query params on the Apify task URL). Fix and rerun.'
}}];