const cfg = $('Check Tag Column').first().json;
const inp = $('Resolve Inputs').first().json;
const s = $getWorkflowStaticData('global');
s.stt = s.stt || {};
const st = s.stt[$execution.id] || { scanned: 0, changed: 0, unchanged: 0, filled: 0, overwritten: 0, pages: 0, batches: 0 };
delete s.stt[$execution.id];
const duration = Math.max(0, Math.round((Date.now() - new Date(inp.startedAt).getTime()) / 1000));
const description = 'Stamped Tag on ' + cfg.tableName + ' (' + cfg.tableId + ') in ' + cfg.baseId + '.\n' +
  'Tag written: ' + cfg.tag + '.\n' +
  'Scope: ' + cfg.filterNote + '.\n' +
  'Scanned ' + st.scanned + ', changed ' + st.changed + ', already carrying the tag ' + st.unchanged + '.\n' +
  'Of the changed rows: ' + st.filled + ' were blank, ' + st.overwritten + ' held a different Tag and were overwritten.\n' +
  'Pages read ' + st.pages + ', write batches ' + st.batches + '. Plain record updates, never an upsert. Build Date was never in a payload.';
const fields = {
  'Execution ID': String($execution.id),
  'Automation': 'Stamp Tag on table',
  'Status': 'Succeeded',
  'Description': description,
  'Run at': inp.startedAt,
  'Target': cfg.tableName,
  'Table ID': cfg.tableId,
  'Tag': cfg.tag,
  'Duration s': duration,
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Records In': st.scanned,
  'Records Out': st.changed,
  'Errors': 0,
  'Trigger': inp.triggerKind === 'webhook' ? 'webhook' : 'form'
};
const body = inp.launchRecordId ? { records: [{ id: inp.launchRecordId, fields }], typecast: true } : { records: [{ fields }], typecast: true };
return [{ json: { hasLaunchRecord: !!inp.launchRecordId, body, summary: description } }];