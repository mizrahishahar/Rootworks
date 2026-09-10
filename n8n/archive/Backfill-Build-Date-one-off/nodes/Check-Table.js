const g = $('Head Guard').first().json;
const resp = $input.first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : [];
if (!tables.length) { throw new Error('No tables came back for base ' + g.baseId + '. Check the base id and that the Airtable token has schema access. Airtable said: ' + JSON.stringify(resp.error || resp) + '. Nothing was written.'); }
const t = tables.filter(function (x) { return x && x.id === g.tableId; })[0];
if (!t) { throw new Error('Table ' + g.tableId + ' is not in base ' + g.baseId + '. Tables present: ' + tables.map(function (x) { return x.name + ' (' + x.id + ')'; }).join(', ') + '. Nothing was written.'); }
const names = (Array.isArray(t.fields) ? t.fields : []).map(function (x) { return x.name; });
const hasIngested = names.indexOf('ingested_at') > -1;
const hasCreated = names.indexOf('Created') > -1;
const hasBuildDate = names.indexOf('Build Date') > -1;
if (!hasIngested && !hasCreated) { throw new Error('\'' + t.name + '\' has neither ingested_at nor Created, so Build Date cannot be derived. Nothing was written.'); }
return [{ json: { baseId: g.baseId, tableId: g.tableId, tableName: t.name, hasIngested: hasIngested, hasCreated: hasCreated, hasBuildDate: hasBuildDate, startedAt: g.startedAt } }];