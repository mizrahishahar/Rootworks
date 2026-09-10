const j = $input.first().json || {};
if (j && j.mode === 'append') {
  if (!j.tableId) { throw new Error('Table resolution returned no table id: ' + JSON.stringify(j).slice(0,400) + '. Nothing was written.'); }
  return [{ json: { tableId: j.tableId, tableName: j.tableName, mode: 'append', fieldsCreated: j.fieldsCreated || [], buildNameIgnored: !!j.buildNameIgnored, createdFieldError: j.createdFieldError || '' } }];
}
const ct = $('Created Table Guard').first().json || {};
const fr = $('AT Add Created Formula').first().json || {};
if (!fr.id) { throw new Error("Created the table '" + (ct.tableName || '') + "' (" + (ct.tableId || '') + ') but could not add the computed Build Date field: ' + JSON.stringify(fr).slice(0,300) + '. Nothing was written.'); }
const fieldsCreated = (ct.fieldNames || []).concat([fr.name || 'Build Date']);
return [{ json: { tableId: ct.tableId, tableName: ct.tableName, mode: 'create', fieldsCreated, buildNameIgnored: false, createdFieldError: '' } }];