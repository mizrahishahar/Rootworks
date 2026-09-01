// Init Loop State: one static-data record carries the batch loop. Counters only; rows never
// cross the sub-workflow boundary. kept is the spend meter (rows prepared for the write,
// what the cap counts); upserted is what actually landed (record ids returned).
const qs = $('Build SL Query').all().map(i => ({ provider: i.json._provider, pullQuery: i.json.pullQuery }));
const cap = Number($('Build SL Query').first().json.maxCompanies);
if (!Number.isFinite(cap) || cap < 1) throw new Error('Loop cap missing: Max companies did not reach the loop. Nothing was pulled.');
const sd = $getWorkflowStaticData('global');
sd.slBatchState = { cap, qIndex: 0, cursor: '', batchNum: 0, retried: false, remaining: cap, totals: { pulled: 0, kept: 0, upserted: 0, withEmails: 0, failed: 0, skipped: 0, inactive: 0, duplicate: 0 }, failReasons: [] };
return [{ json: { action: 'continue', qIndex: 0, cursor: '', remaining: cap, queries: qs } }];
