const sd = $getWorkflowStaticData('global');
const g = $('Check Table').first().json;
const scanned = sd.bd_scanned || 0;
const written = sd.bd_written || 0;
const alreadySet = sd.bd_alreadySet || 0;
const fromIngested = sd.bd_fromIngested || 0;
const fromCreated = sd.bd_fromCreated || 0;
const unresolved = sd.bd_unresolved || 0;
const samples = Array.isArray(sd.bd_unresolvedSamples) ? sd.bd_unresolvedSamples.slice(0, 20) : [];
const writeFail = sd.bd_writeFail || 0;
const pages = sd.bd_pages || 0;
const capped = !!sd.bd_capped;
const fieldCreated = !!sd.bd_fieldCreated;
const startedAt = sd.bd_startedAt || g.startedAt;
const duration = Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
let clientId = '';
const c = (($input.first() || { json: {} }).json) || {};
if (c.id && String(c.id).indexOf('rec') === 0) { clientId = String(c.id); }
const status = (writeFail > 0 || capped) ? 'Partial' : 'Success';
const target = g.tableName + ' (' + g.tableId + ')';
const desc = [
  '- Table: ' + target,
  '- Rows scanned: ' + scanned,
  '- Dates written: ' + written,
  '- Already had Build Date: ' + alreadySet,
  '- From ingested_at: ' + fromIngested,
  '- From Created: ' + fromCreated,
  '- Unresolved: ' + unresolved + (samples.length ? ' (sample ids: ' + samples.join(', ') + ')' : ''),
  '- Write failures: ' + writeFail,
  '- Pages fetched: ' + pages + (capped ? ' (hit the 1000-page cap, table not fully scanned)' : ''),
  '- Build Date column: ' + (fieldCreated ? 'created by this run' : 'already existed')
].join('\n');
delete sd.bd_scanned;
delete sd.bd_written;
delete sd.bd_alreadySet;
delete sd.bd_fromIngested;
delete sd.bd_fromCreated;
delete sd.bd_unresolved;
delete sd.bd_unresolvedSamples;
delete sd.bd_writeFail;
delete sd.bd_pages;
delete sd.bd_capped;
delete sd.bd_fieldCreated;
delete sd.bd_startedAt;
return [{ json: {
  'Automation': 'Backfill Build Date',
  'Status': status,
  'Run at': new Date().toISOString(),
  'Client': clientId ? [clientId] : [],
  'Target': target,
  'Records In': scanned,
  'Records Out': written,
  'Duration s': duration,
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Description': desc
} }];