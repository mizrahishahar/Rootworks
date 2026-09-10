const j = $input.first().json || {};
const baseId = (($('Companies Upload').first().json['Clayroots Base ID'])||'').trim();
if (!j.id) { throw new Error('Airtable build-table creation failed in base ' + baseId + ': ' + JSON.stringify(j).slice(0,400) + '. Nothing was written.'); }
return [{ json: { tableId: j.id, tableName: j.name, fieldNames: (j.fields || []).map(f => f.name) } }];