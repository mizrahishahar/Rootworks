const cfg = $('Check Tag Column').first().json;
const s = $getWorkflowStaticData('global');
s.stt = s.stt || {};
if (!s.stt[$execution.id]) { s.stt[$execution.id] = { scanned: 0, changed: 0, unchanged: 0, filled: 0, overwritten: 0, pages: 0, batches: 0 }; }
const st = s.stt[$execution.id];

const readVal = (v) => {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') { return typeof v.value === 'string' ? v.value : ''; }
  return String(v);
};

const resp = $input.first().json || {};
const records = Array.isArray(resp.records) ? resp.records : [];
const updates = [];
for (const rec of records) {
  const f = (rec && rec.fields) || {};
  st.scanned++;
  const current = readVal(f['Tag']);
  if (current === cfg.tag) { st.unchanged++; continue; }
  if (current.trim()) { st.overwritten++; } else { st.filled++; }
  updates.push({ id: rec.id, fields: { 'Tag': cfg.tag } });
  st.changed++;
}

const chunks = [];
for (let i = 0; i < updates.length; i += 10) { chunks.push({ records: updates.slice(i, i + 10) }); }
st.pages++;
st.batches += chunks.length;

const offset = resp.offset ? String(resp.offset) : '';
const nextUrl = offset ? (cfg.baseUrl + '&offset=' + encodeURIComponent(offset)) : '';
return [{ json: { chunks, chunkCount: chunks.length, pageUrl: nextUrl, more: !!offset } }];