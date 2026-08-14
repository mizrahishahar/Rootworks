const s = $('Collect Results').first().json;
let clientRec = [];
try { const rc = $('Resolve Client').first().json; if (rc && rc.id) { clientRec = [rc.id]; } } catch (e) {}
let dur = 0;
try { if (s.startedAt) { dur = Math.max(0, Math.round(($now.toMillis() - new Date(s.startedAt).getTime()) / 1000)); } } catch (e) {}
const status = (s.writeFailures > s.rowsUpserted) ? 'Failed' : 'Succeeded';
const ruleLabel = 'precedence rule ' + s.keyRuleIndex + ' of 3';
const lines = [];
lines.push('• Source table: ' + s.sourceName + ' (' + s.sourceTableId + ')');
lines.push('• Target table: ' + s.targetName + ' (' + s.targetTableId + ')');
lines.push('• Key used: ' + s.keyRule + ' (' + ruleLabel + '; source field ' + s.sourceKeyField + ', target field ' + s.targetKeyField + ')');
lines.push('• Rows read: ' + s.rowsRead);
lines.push('• Rows upserted: ' + s.rowsUpserted);
lines.push('• Rows skipped (empty key): ' + s.rowsSkipped);
lines.push('• Write failures: ' + s.writeFailures);
lines.push('• Fields created: ' + (s.fieldsCreated.length ? s.fieldsCreated.join(', ') : 'none'));
lines.push('• Fields skipped as uncopyable: ' + (s.fieldsSkipped.length ? s.fieldsSkipped.join(', ') : 'none'));
lines.push('• Pages fetched: ' + s.pages + (s.capHit ? ' (RUNAWAY CAP of 1000 pages hit, the source table was not read to the end)' : ''));
lines.push('• Launched via ' + s.launchedVia + (s.sourceFieldUsed ? ' (source table id read from the ' + s.sourceFieldUsed + ' field)' : ''));
lines.push('• Source table left untouched.');
const desc = lines.join('\n');
return [{ json: { 'Automation': 'Merge Tables', 'Status': status, 'Run at': $now.toISO(), 'Client': clientRec, 'Target': s.targetName + ' (' + s.targetTableId + ')', 'Table ID': s.targetTableId, 'Records In': s.rowsRead, 'Records Out': s.rowsUpserted, 'Errors': s.writeFailures, 'Duration s': dur, 'Description': desc, 'Execution Link': 'https://n8n.flowroots.com/workflow/' + $workflow.id + '/executions/' + $execution.id, 'Execution ID': String($execution.id) } }];