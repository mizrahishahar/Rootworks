const sd = $getWorkflowStaticData('global');
let url = '';
let err = sd.overflowError || '';

let j = {};
try { const f = $input.first(); j = (f && f.json) ? f.json : {}; } catch (e) { j = {}; }

if (j && j.id) {
  url = j.webViewLink || ('https://drive.google.com/file/d/' + j.id + '/view');
  err = '';
} else if (!err) {
  let m = 'unknown error';
  try {
    if (j && j.error) m = String((j.error && j.error.message) ? j.error.message : j.error);
    else if (j && j.message) m = String(j.message);
  } catch (e) {}
  err = 'Leads Overflow report upload failed: ' + m;
}

sd.overflowUrl = url;
sd.overflowError = url ? '' : err;
return [{ json: { _overflowUrl: url, _overflowError: sd.overflowError } }];