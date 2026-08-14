const c = $('Reconcile Fields').first().json;
const S = $getWorkflowStaticData('global');
const k = 'mt_' + $execution.id;
const st = S[k] || { pages: 0, rowsRead: 0, rowsUpserted: 0, rowsSkipped: 0, writeFailures: 0, capHit: false };
const res = $('Fetch Source Page').first().json || {};
const recs = res.records || [];
st.pages = (st.pages || 0) + 1;
st.rowsRead = (st.rowsRead || 0) + recs.length;
let kept = 0; let skipped = 0;
for (const r of recs) { const raw = (r.fields || {})[c.sourceKeyField]; const s = (raw === null || raw === undefined) ? '' : String(Array.isArray(raw) ? raw.join(',') : raw).trim(); if (s) { kept++; } else { skipped++; } }
st.rowsSkipped = (st.rowsSkipped || 0) + skipped;
const MAX_PAGES = 1000;
let action = 'done';
if (res.offset) { if (st.pages >= MAX_PAGES) { st.capHit = true; } else { action = 'continue'; } }
st.action = action;
st.pageOffset = action === 'continue' ? res.offset : '';
S[k] = st;
return [{ json: { baseId: c.baseId, sourceTableId: c.sourceTableId, pageOffset: st.pageOffset, action: action, pageRows: recs.length, keptRows: kept, skippedRows: skipped, page: st.pages } }];