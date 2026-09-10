const j = $('AT Create Table').first().json || {};
const baseId = (($('Contacts Launch').first().json['Clayroots Base ID'])||'').trim();
if (!j.id) { throw new Error('Airtable contacts-table creation failed in base ' + baseId + ': ' + JSON.stringify(j).slice(0,400)); }
const fld = $('AT Add Rank Formula').first().json || {};
if (!fld.id) { throw new Error('Seniority Rank formula field creation failed on table ' + j.id + ': ' + JSON.stringify(fld).slice(0,400)); }
return [{ json: { mode: 'create', tableId: j.id, tableName: j.name, rankFieldId: fld.id, fieldNames: (j.fields || []).map(f => f.name).concat(['Seniority Rank']) } }];