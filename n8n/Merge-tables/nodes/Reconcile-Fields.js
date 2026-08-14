const p = $('Plan Fields').first().json;
const tables = ($input.first().json.tables) || [];
const tgt = tables.filter(function (t) { return t.id === p.targetTableId; })[0];
const tNames = ((tgt && tgt.fields) || []).map(function (f) { return f.name; });
const tLower = {};
for (const n of tNames) { tLower[String(n).toLowerCase()] = n; }
const UNCOPYABLE = p.uncopyableTypes || [];
const fieldMap = {}; const notCopied = []; const created = [];
for (const f of (p.sourceFields || [])) { if (UNCOPYABLE.indexOf(f.type) >= 0) { continue; } const t = tLower[String(f.name).toLowerCase()]; if (t) { fieldMap[f.name] = t; } else { notCopied.push(f.name); } }
for (const m of (p.missingFields || [])) { if (tLower[String(m.name).toLowerCase()]) { created.push(m.name); } }
const targetKeyField = tLower[String(p.targetKeyField).toLowerCase()] || p.targetKeyField;
if (!fieldMap[p.sourceKeyField]) { throw new Error('Head guard: key field ' + p.sourceKeyField + ' could not be mapped onto the target table. Nothing was written.'); }
const S = $getWorkflowStaticData('global');
for (const key of Object.keys(S)) { if (key.indexOf('mt_') === 0 || key.indexOf('mtscan_') === 0) { delete S[key]; } }
S['mt_' + $execution.id] = { pages: 0, rowsRead: 0, rowsUpserted: 0, rowsSkipped: 0, writeFailures: 0, capHit: false, action: 'continue', pageOffset: '' };
const skippedNotes = (p.uncopyable || []).concat(notCopied.map(function (n) { return n + ' (still absent on target)'; }));
return [{ json: { baseId: p.baseId, sourceTableId: p.sourceTableId, targetTableId: p.targetTableId, sourceName: p.sourceName, targetName: p.targetName, keyRule: p.keyRule, keyRuleIndex: p.keyRuleIndex, sourceKeyField: p.sourceKeyField, targetKeyField: targetKeyField, fieldMap: fieldMap, fieldsCreated: created, fieldsSkipped: skippedNotes, launchedVia: p.launchedVia, sourceFieldUsed: p.sourceFieldUsed, startedAt: p.startedAt, pageOffset: '' } }];