let trig = 'form';
let baseId = '', table = '', viewId = '', launchRecordId = '', startedAt = '';
try {
  const f = $('Rank In Company Form').first().json;
  if (f) { baseId = String(f['Clayroots Base ID'] || '').trim(); table = String(f['Table'] || '').trim(); viewId = String(f['View ID'] || '').trim(); startedAt = f.submittedAt || ''; }
} catch (e) {}
if (!baseId) {
  try {
    const p = $('Restore Params').first().json;
    if (p) { trig = 'record'; baseId = String(p.baseId || '').trim(); table = String(p.table || '').trim(); viewId = String(p.viewId || '').trim(); launchRecordId = String(p.launchRecordId || ''); startedAt = p.startedAt || ''; }
  } catch (e) {}
}
// A blank table means People; Resolve Table turns the name into the id from the base meta.
if (!table) { table = 'People'; }
const vm = viewId.match(/viw[A-Za-z0-9]{14}/);
if (vm) { viewId = vm[0]; }
if (!startedAt) { startedAt = $now.toISO(); }
return [{ json: { baseId: baseId, table: table, viewId: viewId, launchRecordId: launchRecordId, trigger: trig, startedAt: startedAt } }];