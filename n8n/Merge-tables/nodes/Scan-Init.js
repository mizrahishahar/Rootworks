const g = $('Guard Tables').first().json;
const S = $getWorkflowStaticData('global');
S['mtscan_' + $execution.id] = { seen: {}, pages: 0, which: 'source' };
return [{ json: { scanBase: g.baseId, scanTable: g.sourceTableId, scanTableName: g.sourceName, scanField: g.sourceKeyField, scanOffset: '', scanWhich: 'source', scanAction: 'continue' } }];