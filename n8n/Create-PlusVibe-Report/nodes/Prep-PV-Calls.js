const cw=$input.first().json;
return [
 { json: Object.assign({}, cw, { pvUrl: 'https://api.plusvibe.ai/api/v1/analytics/campaign/count?workspace_id='+cw.pvWorkspace+'&start_date='+cw.weekStart+'&end_date='+cw.weekEnd }) },
 { json: Object.assign({}, cw, { pvUrl: 'https://api.plusvibe.ai/api/v1/campaign/list-all?workspace_id='+cw.pvWorkspace+'&limit=100' }) }
];