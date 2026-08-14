const cfg=$('Parse Config').first().json||{};
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
 'Description': '**Run FAILED, no Clayroots Base ID**\n\n**Client row:** '+(cfg.client||'(unknown)')+'\n\nHead guard tripped after the client row read: the client row has no Clayroots Base ID, so the intent base cannot be resolved. Fill Clayroots Base ID on the Hub Clients row and rerun.'
}}];