let trig = 'form';
let baseId = '', tableId = '', viewId = '', launchRecordId = '', startedAt = '';
try {
  const f = $('Rank In Company Form').first().json;
  if (f) { baseId = String(f['Clayroots Base ID'] || '').trim(); tableId = String(f['Table ID'] || '').trim(); viewId = String(f['View ID'] || '').trim(); startedAt = f.submittedAt || ''; }
} catch (e) {}
if (!baseId) {
  try {
    const p = $('Restore Params').first().json;
    if (p) { trig = 'record'; baseId = String(p.baseId || '').trim(); tableId = String(p.tableId || '').trim(); viewId = String(p.viewId || '').trim(); launchRecordId = String(p.launchRecordId || ''); startedAt = p.startedAt || ''; }
  } catch (e) {}
}
const tm = tableId.match(/tbl[A-Za-z0-9]{14}/);
tableId = tm ? tm[0] : tableId;
const vm = viewId.match(/viw[A-Za-z0-9]{14}/);
if (vm) { viewId = vm[0]; }
if (!startedAt) { startedAt = $now.toISO(); }
return [{ json: { baseId: baseId, tableId: tableId, viewId: viewId, launchRecordId: launchRecordId, trigger: trig, startedAt: startedAt } }];