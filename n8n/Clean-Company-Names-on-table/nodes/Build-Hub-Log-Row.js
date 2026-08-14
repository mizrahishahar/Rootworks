const cfg = $('Detect Company Columns').first().json;
const inp = $('Resolve Inputs').first().json;
const s = $getWorkflowStaticData('global');
s.ccn = s.ccn || {};
const st = s.ccn[$execution.id] || { scanned: 0, changed: 0, unchanged: 0, blank: 0, quarantined: 0, pipe: 0, dash: 0, legal: 0, symbol: 0, pages: 0, batches: 0 };
delete s.ccn[$execution.id];
const duration = Math.max(0, Math.round((Date.now() - new Date(inp.startedAt).getTime()) / 1000));
const columns = cfg.cleanWritable ? 'Company + company_clean' : 'Company';
const description = 'Cleaned company names on ' + cfg.tableName + ' (' + cfg.tableId + ') in ' + cfg.baseId + '.\n' +
  'Columns targeted: ' + columns + '. ' + cfg.cleanNote + '.\n' +
  'Scanned ' + st.scanned + ', changed ' + st.changed + ', already correct ' + st.unchanged + ', blank ' + st.blank + ', quarantined ' + st.quarantined + '.\n' +
  'Change types: pipe truncation ' + st.pipe + ', dash truncation ' + st.dash + ', legal suffix ' + st.legal + ', symbol ' + st.symbol + '.\n' +
  'Pages read ' + st.pages + ', write batches ' + st.batches + '.';
const fields = {
  'Execution ID': String($execution.id),
  'Automation': 'Clean Company Names on table',
  'Status': 'Succeeded',
  'Description': description,
  'Run at': inp.startedAt,
  'Target': cfg.tableName,
  'Table ID': cfg.tableId,
  'Duration s': duration,
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Records In': st.scanned,
  'Records Out': st.changed,
  'Errors': 0,
  'Trigger': inp.triggerKind === 'webhook' ? 'webhook' : 'form'
};
const body = inp.launchRecordId ? { records: [{ id: inp.launchRecordId, fields }], typecast: true } : { records: [{ fields }], typecast: true };
return [{ json: { hasLaunchRecord: !!inp.launchRecordId, body, summary: description } }];