const j = $input.first().json || {};
if (j && j.mode === 'append') {
  if (!j.tableId) { throw new Error('Table resolution returned no table id: ' + JSON.stringify(j).slice(0,400)); }
  return [{ json: { tableId: j.tableId, tableName: j.tableName, mode: 'append', fieldsCreated: j.fieldsCreated || [], buildNameIgnored: !!j.buildNameIgnored, createdFieldError: j.createdFieldError || '' } }];
}
const ct = $('Created Table Guard').first().json || {};
const bd = $('AT Add Created Formula').first().json || {};
if (!bd.id) { throw new Error("Build Date formula field creation failed on new table '" + (ct.tableName || '') + "' (" + (ct.tableId || '') + '): ' + JSON.stringify(bd).slice(0,400) + '. Nothing was written.'); }
const fieldsCreated = (ct.fieldNames || []).slice().concat(['Build Date']);
return [{ json: { tableId: ct.tableId, tableName: ct.tableName, mode: 'create', fieldsCreated, buildNameIgnored: false, createdFieldError: '' } }];