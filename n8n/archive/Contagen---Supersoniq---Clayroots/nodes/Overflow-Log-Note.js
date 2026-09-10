// Mirrors the createdFieldError pattern in Build Log: push a line onto the log and,
// on failure, flip Status to 'Succeeded with errors'. The contact data is already in
// Airtable by this point, so a Drive problem must never kill the run.
const base = $('Fix Client').first().json;
const log = { ...base };

let ov = { count: 0 };
try { ov = $('Overflow Set').first().json._overflow || ov; } catch (e) {}

const warnings = [];
let successLine = '';

if (ov.count > 0) {
  if (!ov.driveMainFolderID) {
    warnings.push('• Overflow report NOT written: the client record carries no driveMainFolderID (' + ov.count + ' domains without contacts).');
  } else {
    let reportsFound = 0;
    try { reportsFound = $('Find Reports Folder').all().filter((i) => i.json.name === 'Reports').length; } catch (e) {}
    if (!reportsFound) {
      warnings.push('• Overflow report NOT written: no "Reports" folder under the client Drive folder (' + ov.count + ' domains without contacts).');
    } else {
      let uploaded = null;
      try { if ($('Upload Overflow CSV').isExecuted) uploaded = $('Upload Overflow CSV').first().json; } catch (e) {}
      const fileId = uploaded && typeof uploaded.id === 'string' ? uploaded.id : '';
      if (fileId) {
        const url = uploaded.webViewLink || ('https://drive.google.com/file/d/' + fileId + '/view');
        successLine = '• Domains without contacts: ' + ov.count + ' written to Reports/Leads Overflow, ' + url;
      } else {
        let why = 'the upload returned no file ID';
        if (uploaded && uploaded.error) { why = String(uploaded.error.message || uploaded.error).slice(0, 240); }
        warnings.push('• Overflow report upload FAILED (' + ov.count + ' domains without contacts): ' + why);
      }
    }
  }
}

const extra = [];
if (successLine) extra.push(successLine);
for (const w of warnings) extra.push(w);

if (extra.length) {
  log.Description = String(log.Description || '') + '\n' + extra.join('\n');
}
if (warnings.length && log.Status === 'Succeeded') {
  log.Status = 'Succeeded with errors';
}

return [{ json: log }];
