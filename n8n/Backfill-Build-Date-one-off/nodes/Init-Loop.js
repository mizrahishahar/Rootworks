const g = $('Check Table').first().json;
const fieldCreated = !!(($input.first() || { json: {} }).json || {}).fieldCreated;
const fields = ['Build Date'];
if (g.hasIngested) { fields.push('ingested_at'); }
if (g.hasCreated) { fields.push('Created'); }
const qs = ['pageSize=100'].concat(fields.map(function (f) { return 'fields%5B%5D=' + encodeURIComponent(f); })).join('&');
const sd = $getWorkflowStaticData('global');
sd.bd_scanned = 0;
sd.bd_alreadySet = 0;
sd.bd_fromIngested = 0;
sd.bd_fromCreated = 0;
sd.bd_unresolved = 0;
sd.bd_unresolvedSamples = [];
sd.bd_written = 0;
sd.bd_writeFail = 0;
sd.bd_pages = 0;
sd.bd_capped = false;
sd.bd_fieldCreated = fieldCreated;
sd.bd_startedAt = g.startedAt || new Date().toISOString();
return [{ json: { baseUrl: 'https://api.airtable.com/v0/' + g.baseId + '/' + g.tableId + '?' + qs, offset: '', page: 0, done: false } }];