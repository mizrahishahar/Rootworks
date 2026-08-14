const rec = $('Fetch Launch Record').first().json || {};
const rf = rec.fields || rec;
const wantClient = Array.isArray(rf['Client']) ? String(rf['Client'][0] || '').trim() : String(rf['Client'] == null ? '' : rf['Client']).trim();
let cf = {};
try {
  const cl = $('Fetch Launch Client').first().json || {};
  if (Array.isArray(cl.records)) {
    const hit = cl.records.find(function (r) { return r && r.id === wantClient; });
    cf = (hit && hit.fields) ? hit.fields : {};
  } else {
    cf = cl.fields || cl;
  }
} catch (e) { cf = {}; }
const baseId = String(cf['Clayroots Base ID'] || '').trim();
if (!/^app[A-Za-z0-9]{14}$/.test(baseId)) { throw new Error('Launch record ' + (rec.id || '') + ' resolves to no Clayroots Base ID (linked Client: ' + (wantClient || 'none') + '). Nothing was written.'); }
let raw = String(rf['Table ID'] == null ? '' : rf['Table ID']).trim();
if (!raw) { raw = String(rf['Target'] == null ? '' : rf['Target']).trim(); }
const m = raw.match(/tbl[A-Za-z0-9]{14}/);
const tableId = m ? m[0] : '';
if (!tableId) { throw new Error('Launch record ' + (rec.id || '') + ' has no Table ID (and no tbl id inside Target). Nothing was written.'); }
let viewId = String(rf['View'] == null ? '' : rf['View']).trim();
const vm = viewId.match(/viw[A-Za-z0-9]{14}/);
if (vm) { viewId = vm[0]; }
return [{ json: { baseId: baseId, tableId: tableId, viewId: viewId, launchRecordId: rec.id || '', startedAt: $now.toISO() } }];