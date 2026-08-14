const g = $('Guard Input').first().json;
const cfg = $('Init Backfill').first().json;
const sd = $getWorkflowStaticData('global');
const st = sd.ackState || {};
let clientRec = [];
try { const rc = $('Resolve Client').first().json; if (rc && rc.id) { clientRec = [rc.id]; } } catch (e) { clientRec = []; }
let capped = false;
try { capped = !!$('Next Page').first().json.capped; } catch (e) { capped = false; }
let dur = 0;
try { if (g.startedAt) { dur = Math.max(0, Math.round(($now.toMillis() - new Date(g.startedAt).getTime()) / 1000)); } } catch (e) { dur = 0; }
const samples = (st.dupSamples || []).slice(0, 20);
const dupCount = st.dupCount || 0;
const lines = [];
lines.push('• Table: ' + cfg.tableName + ' (' + cfg.tableId + ')');
lines.push('• Name source used: ' + cfg.nameSource);
lines.push('• Rows scanned: ' + (st.rowsScanned || 0));
lines.push('• Keys written: ' + (st.keysWritten || 0));
lines.push('• Already had a key: ' + (st.alreadyHadKey || 0));
lines.push('• Skipped, no domain: ' + (st.skippedNoDomain || 0));
lines.push('• Skipped, no usable name: ' + (st.skippedNoName || 0));
lines.push('• Write failures: ' + (st.writeFailures || 0));
lines.push('• Duplicate keys generated: ' + dupCount + (samples.length ? ' (samples: ' + samples.join(', ') + ')' : ''));
lines.push('• Pages fetched: ' + (st.pages || 0));
lines.push('• Contact Key column: ' + (cfg.columnCreated ? 'created by this run' : 'already existed'));
lines.push('• Launched via: ' + g.trigger);
if (dupCount > 0) { lines.push('• Warning: ' + dupCount + ' rows share a Contact Key with another row in this table. Merging or deduping this table will collapse them.'); }
if (capped) { lines.push('• Warning: the 1000 page cap was reached, so the table was not scanned to the end.'); }
if (sd.ackState) { delete sd.ackState.keys; }
return [{ json: {
  'Automation': 'Add Contact Key',
  'Status': 'Succeeded',
  'Run at': $now.toISO(),
  'Client': clientRec,
  'Target': cfg.tableName + ' (' + cfg.tableId + ')',
  'Records In': st.rowsScanned || 0,
  'Records Out': st.keysWritten || 0,
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id,
  'Execution ID': String($execution.id)
} }];