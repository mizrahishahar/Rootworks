// Base guard tripped: the client row has no Clayroots Base ID. One error, nothing paid.
const cfg=$('Parse Config').first().json||{};
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
 'Description': '**No Clayroots Base ID on the client row, 1 error**\n\n**Client row:** '+(cfg.client||'(unknown)')+'\n\nHead guard tripped after the client row read: without a Clayroots Base ID the intent table cannot be resolved. Fill Clayroots Base ID on the Hub Clients row and rerun.'
};
if(cfg.client) row['Client']=[cfg.client];
return [{json:row}];
