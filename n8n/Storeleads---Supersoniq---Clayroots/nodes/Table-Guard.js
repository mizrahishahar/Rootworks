const t = $('AT Create Table').first().json || {};
if (!t.id) { throw new Error('Airtable build-table creation failed: ' + JSON.stringify(t).slice(0, 500)); }
return [{ json: { tableId: t.id, tableName: t.name } }];