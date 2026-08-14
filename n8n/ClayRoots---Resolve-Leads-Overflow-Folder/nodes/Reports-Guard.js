const id = $json.id;
if (!id) { throw new Error('Reports folder not found under main folder ' + $('Pick Main Folder').first().json.mainFolderId + ' - client folder anatomy is broken, fix the Drive folder first.'); }
return [{ json: { reportsId: id } }];