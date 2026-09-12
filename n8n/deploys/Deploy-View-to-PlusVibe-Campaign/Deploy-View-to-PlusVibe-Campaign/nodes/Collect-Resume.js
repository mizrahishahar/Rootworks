// Collect Resume: the activate call answered. Success is recorded on the run row; a refusal is an
// error on the run, named, because a campaign left COMPLETED with fresh leads is exactly the silent
// failure this exists to end.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
const j = ($input.first() || {}).json || {};
const hasWrap = Object.prototype.hasOwnProperty.call(j, 'body');
const rb = hasWrap ? j.body : j;
const status = Number(j.statusCode || 0);
const ok = status >= 200 && status < 300 && !(rb && rb.error);
if (ok) D.resumed = 'yes (' + (D.uploadedNew || 0) + ' new leads)';
else D.errors.push('campaign was COMPLETED and could not be activated after the upload (status ' + (status || '?') + '): ' + JSON.stringify(rb || j.error || {}).slice(0, 200));
return [{ json: { resumed: ok } }];
