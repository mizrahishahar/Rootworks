const cfg = $('Init Read Loop').first().json;
const resp = $input.first().json || {};
if (!Array.isArray(resp.records)) { throw new Error('Airtable read failed on table ' + cfg.tableId + ' in base ' + cfg.baseId + ': ' + JSON.stringify(resp).slice(0, 400) + '. Nothing was written.'); }
const sd = $getWorkflowStaticData('global');
if (!Array.isArray(sd.ricRows)) { sd.ricRows = []; }
function score(v) {
  let s = v;
  if (Array.isArray(s)) { s = s.length ? s[0] : ''; }
  s = String(s == null ? '' : s).trim().toLowerCase();
  if (!s) { return 5; }
  if (s === 'c-suite' || s === 'founder' || s === 'owner' || s === 'president' || s === 'executive') { return 1; }
  if (s === 'vp') { return 2; }
  if (s === 'head' || s === 'director') { return 3; }
  if (s === 'manager') { return 4; }
  return 5;
}
for (let i = 0; i < resp.records.length; i++) {
  const r = resp.records[i];
  const f = r.fields || {};
  const d = String(f.Domain == null ? '' : f.Domain).trim().toLowerCase();
  const cur = Number(f.RankInCompany);
  sd.ricRows.push([r.id, d, score(f.Seniority), (f.RankInCompany == null || isNaN(cur)) ? 0 : cur]);
}
sd.ricPages = (sd.ricPages || 0) + 1;
const off = resp.offset || '';
const done = (!off) || (sd.ricPages >= 1000);
return [{ json: { baseId: cfg.baseId, tableId: cfg.tableId, tableName: cfg.tableName, viewId: cfg.viewId || '', viewParam: cfg.viewParam || '', offset: off, page: sd.ricPages, done: done } }];