const c = $('Config').first().json;
if (!/^app[A-Za-z0-9]{14}$/.test(c.baseId)) { throw new Error('Clayroots Base ID "' + c.baseId + '" is not a valid Airtable base id (expected app followed by 14 characters). Nothing was written.'); }
if (!/^tbl[A-Za-z0-9]{14}$/.test(c.tableId)) { throw new Error('Table ID "' + c.tableId + '" is not a valid Airtable table id (expected tbl followed by 14 characters). Nothing was written.'); }
return [{ json: c }];