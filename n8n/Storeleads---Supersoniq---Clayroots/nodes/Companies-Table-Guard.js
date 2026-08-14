const tbl = $('AT Create Companies Table').first().json || {};
if(!tbl.id){ throw new Error('Airtable companies-table creation failed in base '+($('Waterfall Storeleads').first().json['Clayroots Base ID'])+': '+JSON.stringify(tbl).slice(0,400)); }
return [{ json: { tableId: tbl.id, tableName: tbl.name } }];