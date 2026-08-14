const sd = $getWorkflowStaticData('global');
const resp = $input.first().json || {};
const records = Array.isArray(resp.records) ? resp.records : [];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const filled = function (v) { return v !== undefined && v !== null && String(v).trim() !== ''; };
const writes = [];
for (let i = 0; i < records.length; i++) {
  const r = records[i] || {};
  const f = r.fields || {};
  sd.bd_scanned = (sd.bd_scanned || 0) + 1;
  if (filled(f['Build Date'])) { sd.bd_alreadySet = (sd.bd_alreadySet || 0) + 1; continue; }
  let value = '';
  let src = '';
  if (filled(f['ingested_at'])) {
    const c1 = String(f['ingested_at']).trim().slice(0, 10);
    if (DATE.test(c1)) { value = c1; src = 'ingested_at'; }
  }
  if (!value && filled(f['Created'])) {
    const c2 = String(f['Created']).trim().slice(0, 10);
    if (DATE.test(c2)) { value = c2; src = 'Created'; }
  }
  if (!value) {
    sd.bd_unresolved = (sd.bd_unresolved || 0) + 1;
    if (!Array.isArray(sd.bd_unresolvedSamples)) { sd.bd_unresolvedSamples = []; }
    if (sd.bd_unresolvedSamples.length < 20) { sd.bd_unresolvedSamples.push(r.id); }
    continue;
  }
  if (src === 'ingested_at') { sd.bd_fromIngested = (sd.bd_fromIngested || 0) + 1; }
  else { sd.bd_fromCreated = (sd.bd_fromCreated || 0) + 1; }
  writes.push({ id: r.id, 'Build Date': value });
}
sd.bd_pages = (sd.bd_pages || 0) + 1;
sd.bd_written = (sd.bd_written || 0) + writes.length;
const baseUrl = $('Init Loop').first().json.baseUrl;
return [{ json: { baseUrl: baseUrl, offset: String(resp.offset || ''), page: sd.bd_pages, writeCount: writes.length, writes: writes } }];