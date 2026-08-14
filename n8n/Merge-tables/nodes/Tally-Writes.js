const c = $('Reconcile Fields').first().json;
const S = $getWorkflowStaticData('global');
const k = 'mt_' + $execution.id;
const st = S[k] || {};
const items = $input.all();
let fails = 0;
for (const i of items) { if (i.json && i.json.error) { fails++; } }
st.writeFailures = (st.writeFailures || 0) + fails;
st.rowsUpserted = (st.rowsUpserted || 0) + (items.length - fails);
S[k] = st;
return [{ json: { baseId: c.baseId, sourceTableId: c.sourceTableId, pageOffset: st.pageOffset || '', action: st.action || 'done' } }];