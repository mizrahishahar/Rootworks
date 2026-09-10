const j = $input.first().json || {};
const baseId = (($('Waterfall Upload').first().json['Clayroots Base ID'])||'').trim();
if (!j.id) { throw new Error('Airtable table creation failed in base ' + baseId + ': ' + JSON.stringify(j).slice(0,400)); }
return [{ json: { mode: 'create', tableId: j.id, tableName: j.name, fieldNames: (j.fields || []).map(f => f.name) } }];