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
// The launch names its table (People or Companies, blank = People); Resolve Table turns it into the id.
const rawTable = rf['Table'];
const table = String(rawTable == null ? '' : ((rawTable && rawTable.name) || rawTable)).trim() || 'People';
let viewId = String(rf['View'] == null ? '' : rf['View']).trim();
const vm = viewId.match(/viw[A-Za-z0-9]{14}/);
if (vm) { viewId = vm[0]; }
return [{ json: { baseId: baseId, table: table, viewId: viewId, launchRecordId: rec.id || '', startedAt: $now.toISO() } }];