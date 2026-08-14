const e = $('Error Trigger').first().json;
const execId = String((e.execution && e.execution.id) || '');
const errMsg = (e.execution && e.execution.error && e.execution.error.message) || 'Unknown error';
const node = (e.execution && e.execution.lastNodeExecuted) || '';
const url = (e.execution && e.execution.url) || '';
const wf = (e.workflow && e.workflow.name) || '';
const auto = wf;
const desc = '**Run FAILED**\n\n**Workflow:** '+wf+'\n**Node:** '+node+'\n**Error:** '+errMsg;
let rec = null;
try { const f = $('Find Run Record').first().json; if (f && f.id) rec = f.id; } catch (err) {}
if (rec) { return [{ json: { _mode:'update', id: rec, 'Status':'Failed', 'Description': desc } }]; }
return [{ json: { _mode:'create', 'Automation': auto, 'Status':'Failed', 'Run at': $now.toISO(), 'Description': desc, 'Execution ID': execId || ('err-' + $now.toMillis()), 'Execution Link': url } }];