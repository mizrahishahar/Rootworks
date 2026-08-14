const c = $('Reconcile Fields').first().json;
const S = $getWorkflowStaticData('global');
const k = 'mt_' + $execution.id;
const st = S[k] || {};
const out = { baseId: c.baseId, sourceTableId: c.sourceTableId, targetTableId: c.targetTableId, sourceName: c.sourceName, targetName: c.targetName, keyRule: c.keyRule, keyRuleIndex: c.keyRuleIndex, sourceKeyField: c.sourceKeyField, targetKeyField: c.targetKeyField, fieldsCreated: c.fieldsCreated || [], fieldsSkipped: c.fieldsSkipped || [], launchedVia: c.launchedVia, sourceFieldUsed: c.sourceFieldUsed, startedAt: c.startedAt, pages: st.pages || 0, rowsRead: st.rowsRead || 0, rowsUpserted: st.rowsUpserted || 0, rowsSkipped: st.rowsSkipped || 0, writeFailures: st.writeFailures || 0, capHit: !!st.capHit };
delete S[k];
if (out.rowsUpserted === 0 && out.writeFailures > 0) { throw new Error('All ' + out.writeFailures + ' row writes into ' + out.targetName + ' failed. The source table was not touched.'); }
return [{ json: out }];