const j = $input.first().json || {};
if (j && j.mode === 'append') {
  if (!j.tableId) { throw new Error('Table resolution returned no table id: ' + JSON.stringify(j).slice(0,400)); }
  return [{ json: { tableId: j.tableId, tableName: j.tableName, mode: 'append', fieldsCreated: j.fieldsCreated || [], buildNameIgnored: !!j.buildNameIgnored, createdFieldError: j.createdFieldError || '' } }];
}
const ct = $('Created Table Guard').first().json || {};
return [{ json: { tableId: ct.tableId, tableName: ct.tableName, mode: 'create', fieldsCreated: (ct.fieldNames || []), buildNameIgnored: false, createdFieldError: '' } }];