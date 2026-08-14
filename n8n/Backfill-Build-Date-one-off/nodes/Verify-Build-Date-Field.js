const g = $('Check Table').first().json;
const resp = $input.first().json || {};
const tables = Array.isArray(resp.tables) ? resp.tables : [];
const t = tables.filter(function (x) { return x && x.id === g.tableId; })[0];
const names = t && Array.isArray(t.fields) ? t.fields.map(function (x) { return x.name; }) : [];
if (names.indexOf('Build Date') === -1) {
  const c = $('Create Build Date Field').first().json;
  throw new Error('The Build Date column did not appear on \'' + g.tableName + '\' after the create call. Airtable said: ' + JSON.stringify(c && c.error ? c.error : c) + '. Nothing was written.');
}
return [{ json: Object.assign({}, g, { fieldCreated: true }) }];