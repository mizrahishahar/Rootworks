const cfg = $('Detect Company Columns').first().json;
const s = $getWorkflowStaticData('global');
s.ccn = s.ccn || {};
if (!s.ccn[$execution.id]) { s.ccn[$execution.id] = { scanned: 0, changed: 0, unchanged: 0, blank: 0, quarantined: 0, pipe: 0, dash: 0, legal: 0, symbol: 0, pages: 0, batches: 0 }; }
const st = s.ccn[$execution.id];

// The cleaning itself happened in the Clean Fields helper (previous node); this node only
// decides what to write and keeps the diagnostic counts of what kind of dirt each name carried.
const classify = (nm) => {
  const t = { pipe: false, dash: false, symbol: false, legal: false };
  let c = String(nm).trim();
  const p = c.indexOf(' | ');
  if (p > -1) { t.pipe = true; c = c.slice(0, p).trim(); }
  const d = c.search(/\s[-–—:]\s/);
  if (d >= 3) { t.dash = true; c = c.slice(0, d).trim(); }
  if (/[®™]/.test(c)) { t.symbol = true; c = c.replace(/[®™]/g, ''); }
  for (let i = 0; i < 2; i++) {
    const m = c.match(/[,\s]+(inc|llc|l\.l\.c\.|ltd|limited|corp|corporation|co|company|gmbh|plc|llp|lp|pllc|pc)\.?$/i);
    if (!m) break;
    const before = c.slice(0, m.index).trim();
    const lastWord = before.split(/\s+/).pop() || '';
    if (lastWord === '&') break;
    t.legal = true;
    c = before;
  }
  return t;
};

const GENERIC = ['home','shop','welcome','about','products','store','index','page','contact'];
const updates = [];
for (const it of $input.all()) {
  const r = it.json || {};
  if (r._empty || !r._recId) continue;
  st.scanned++;
  const companyRaw = String(r._companyRaw || '');
  const cleanRaw = String(r._cleanRaw || '');
  const source = String(r._source || '');
  if (!source.trim()) { st.blank++; continue; }
  const value = String(r.Company || '').trim();
  if (!value || value.length < 3 || GENERIC.indexOf(value.toLowerCase()) > -1) { st.quarantined++; continue; }
  const needCompany = companyRaw !== value;
  const needClean = !!cfg.cleanWritable && cleanRaw !== value;
  if (!needCompany && !needClean) { st.unchanged++; continue; }
  const t = classify(source);
  if (t.pipe) st.pipe++;
  if (t.dash) st.dash++;
  if (t.legal) st.legal++;
  if (t.symbol) st.symbol++;
  const payload = {};
  if (needCompany) payload[cfg.companyField] = value;
  if (needClean) payload[cfg.cleanField] = value;
  updates.push({ id: r._recId, fields: payload });
  st.changed++;
}

const chunks = [];
for (let i = 0; i < updates.length; i += 10) { chunks.push({ records: updates.slice(i, i + 10) }); }
st.pages++;
st.batches += chunks.length;

const resp = $('Fetch Page of 100').first().json || {};
const offset = resp.offset ? String(resp.offset) : '';
const nextUrl = offset ? ('https://api.airtable.com/v0/' + cfg.baseId + '/' + cfg.tableId + '?pageSize=100&offset=' + encodeURIComponent(offset)) : '';
return [{ json: { chunks, chunkCount: chunks.length, pageUrl: nextUrl, more: !!offset } }];
