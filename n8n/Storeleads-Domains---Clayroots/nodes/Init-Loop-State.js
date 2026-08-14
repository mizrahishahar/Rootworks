const qs = $('Build SL Query').all().map(i => ({ provider: i.json._provider, pullQuery: i.json.pullQuery }));
const cap = Math.max(1, Number($('Build SL Query').first().json.maxCompanies) || 500);
const sd = $getWorkflowStaticData('global');
sd.slBatchState = { cap, qIndex: 0, cursor: '', batchNum: 0, retried: false, remaining: cap, totals: { pulled: 0, inserted: 0, withEmails: 0, skipped: 0 } };
return [{ json: { action: 'continue', qIndex: 0, cursor: '', remaining: cap, queries: qs } }];