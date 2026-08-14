const c = $('Reconcile Fields').first().json;
const res = $('Fetch Source Page').first().json || {};
const map = c.fieldMap || {};
const out = [];
for (const r of (res.records || [])) {
  const f = r.fields || {};
  const raw = f[c.sourceKeyField];
  const ks = (raw === null || raw === undefined) ? '' : String(Array.isArray(raw) ? raw.join(',') : raw).trim();
  if (!ks) { continue; }
  const row = {};
  for (const sn of Object.keys(map)) { if (!Object.prototype.hasOwnProperty.call(f, sn)) { continue; } const val = f[sn]; if (val === null || val === undefined || val === '') { continue; } row[map[sn]] = val; }
  if (Object.keys(row).length === 0) { continue; }
  out.push({ json: row });
}
return out;