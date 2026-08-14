const c = $('Head Guard').first().json;
const resp = $input.first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : null;
if (!tables) { throw new Error('Could not read the table list for base ' + c.baseId + ': ' + JSON.stringify(resp).slice(0, 400) + '. Nothing was written.'); }
const target = tables.find(function (t) { return t.id === c.tableId; });
if (!target) { throw new Error('Table ' + c.tableId + ' does not exist in base ' + c.baseId + '. Tables there: ' + tables.map(function (t) { return t.name; }).join(', ') + '. Nothing was written.'); }
const name = String(target.name || '');
if (/domains/i.test(name)) { throw new Error("'" + name + "' is a domains table. There are no contacts to rank. Nothing was written."); }
const have = new Set((target.fields || []).map(function (f) { return f.name; }));
if (!have.has('Domain')) { throw new Error("'" + name + "' has no Domain field, so contacts cannot be grouped by company. Nothing was written."); }
if (!have.has('Seniority')) { throw new Error("'" + name + "' has no Seniority field, so contacts cannot be ranked. Nothing was written."); }
const rankExisted = have.has('RankInCompany');
const views = Array.isArray(target.views) ? target.views : [];
let viewId = '', viewName = '', scope = 'whole table';
const wanted = String(c.viewId == null ? '' : c.viewId).trim();
if (wanted) {
  let v = views.find(function (x) { return String(x.id) === wanted; });
  if (!v) { v = views.find(function (x) { return String(x.name).trim().toLowerCase() === wanted.toLowerCase(); }); }
  if (!v) { throw new Error("View '" + wanted + "' does not exist on '" + name + "' (" + target.id + '). Views there: ' + (views.length ? views.map(function (x) { return x.name; }).join(', ') : '(none)') + '. Nothing was written.'); }
  viewId = v.id; viewName = v.name; scope = 'view ' + viewName + ' (' + viewId + ')';
}
return [{ json: { baseId: c.baseId, tableId: c.tableId, tableName: name, viewId: viewId, viewName: viewName, scope: scope, launchRecordId: c.launchRecordId, trigger: c.trigger, startedAt: c.startedAt, rankExisted: rankExisted, needsRankField: !rankExisted } }];