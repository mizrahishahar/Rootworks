const cfg = $('Init Backfill').first().json;
const resp = $input.first().json || {};
if (!resp || !Array.isArray(resp.records)) { throw new Error('Airtable did not return a records array for table ' + cfg.tableId + ': ' + JSON.stringify(resp).slice(0, 400) + '.'); }
const sd = $getWorkflowStaticData('global');
const st = sd.ackState;
const clean = function (w) { return String(w == null ? '' : w).replace(/[^A-Za-z\-']/g, ''); };
const cap = function (w) { return w ? (w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) : ''; };
const firstToken = function (s) { return cap(clean(String(s == null ? '' : s).trim().split(/[,\s]+/)[0] || '')); };
const titleAll = function (s) { return String(s == null ? '' : s).trim().split(/[,\s]+/).map(clean).filter(function (w) { return w; }).map(cap).join(' '); };
const titleRest = function (s) { return String(s == null ? '' : s).trim().split(/[,\s]+/).slice(1).map(clean).filter(function (w) { return w; }).map(cap).join(' '); };
const out = [];
for (const rec of resp.records) {
  const f = rec.fields || {};
  st.rowsScanned++;
  if (String(f['Contact Key'] == null ? '' : f['Contact Key']).trim()) { st.alreadyHadKey++; continue; }
  const domain = String(f.Domain == null ? '' : f.Domain).trim().toLowerCase();
  if (!domain) { st.skippedNoDomain++; continue; }
  let first = '';
  let last = '';
  const fn = String(f.first_name == null ? '' : f.first_name).trim();
  const ln = String(f.last_name == null ? '' : f.last_name).trim();
  if (cfg.nameSource === 'first_name+last_name' && (fn || ln)) { first = firstToken(fn); last = titleAll(ln); }
  else { const full = String(f.Name == null ? '' : f.Name).trim(); first = firstToken(full); last = titleRest(full); }
  if (!first && !last) { st.skippedNoName++; continue; }
  const key = first.toLowerCase().trim() + last.toLowerCase().trim() + domain;
  if (st.keys[key]) { st.dupCount++; if (st.dupSamples.length < 20 && st.dupSamples.indexOf(key) === -1) { st.dupSamples.push(key); } }
  else { st.keys[key] = 1; }
  out.push({ json: { id: rec.id, 'Contact Key': key } });
}
if (!out.length) { return [{ json: { _noop: true } }]; }
return out;