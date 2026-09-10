// Init Loop State: one static-data record carries the batch loop. Counters only; the rows never
// cross the sub-workflow boundary (the law of 2026-09-09: no execution grows with the size of the
// list, so SL Batch Pull lands its own chunk through the shared helper and answers numbers).
// kept is the spend meter (rows the child prepared for the write, what the cap counts); upserted is
// what actually landed (record ids the helper's upsert returned).
// landedDomains is the one non-counter the child sends back: the domains of this run, so the
// contacts hand-off is scoped to this pull. Strings only, and hard-capped (SCOPE_CAP) so the state
// cannot grow without bound; past the cap the hand-off falls back to the whole view and says so.
const SCOPE_CAP = 20000;
const qs = $('Build SL Query').all().map(i => ({ provider: i.json._provider, pullQuery: i.json.pullQuery }));
const cap = Math.max(1, Number($('Build SL Query').first().json.maxCompanies) || 1);
const sd = $getWorkflowStaticData('global');
sd.slBatchState = { cap, scopeCap: SCOPE_CAP, qIndex: 0, cursor: '', batchNum: 0, retried: false, remaining: cap, totals: { pulled: 0, kept: 0, upserted: 0, newDomains: 0, existingDomains: 0, withEmails: 0, failed: 0, skipped: 0, inactive: 0, duplicate: 0, dnc: 0 }, failReasons: [], providerErrors: 0, providerReason: '', stoppedWhy: '', landedDomains: [], scopeOverflow: false };
return [{ json: { action: 'continue', qIndex: 0, cursor: '', remaining: cap, queries: qs } }];
