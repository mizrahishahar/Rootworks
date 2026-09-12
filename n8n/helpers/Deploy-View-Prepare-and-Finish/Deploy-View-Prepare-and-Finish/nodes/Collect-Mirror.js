// Collect Mirror: the just-created mirror row's id becomes the stamp target. The deployment
// standard normally creates this row at campaign build, so getting here at all is worth a line.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
const j = ($input.first() || {}).json || {};
if (j.id) { D.stampMirrorRid = j.id; D.warnings.push('mirror row created for campaign "' + (D.campName || D.target || '?') + '" (the deployment standard normally creates it at campaign build)'); }
else { D.stampMirrorRid = ''; D.warnings.push('mirror row create failed: ' + JSON.stringify(j.error || j).slice(0, 150) + '; Campaigns links not stamped this run'); }
return [{ json: { mirrorRid: D.stampMirrorRid || '' } }];
