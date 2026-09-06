// Check Bison Campaign: the target must exist on the instance, proven by GET /api/campaigns/{id},
// before a single lead is created. The Hub row is only the description of a campaign, not proof
// that it is there. The name Bison itself carries wins for the run log and the receipt, and the
// campaign's status is kept: attach-leads on an ACTIVE campaign is cached and synced every five
// minutes on Bison's side, so the read-back has to wait that out before it may call a lead missing.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
const p = $('Load State').first().json;
if (!D.abort) {
  const j = ($input.first() || {}).json || {};
  const hasWrap = Object.prototype.hasOwnProperty.call(j, 'body');
  const rb = hasWrap ? j.body : j;
  const status = Number(j.statusCode || 0);
  const c = rb && rb.data && typeof rb.data === 'object' ? rb.data : null;
  if (j.error && !hasWrap && !status) {
    D.abort = 'campaign check failed'; D.errors.push('GET campaign ' + D.target + ' errored before a response: ' + String(j.error).slice(0, 200) + '; nothing was sent');
  } else if (status === 404 || !c || String(c.id) !== String(D.target)) {
    D.abort = 'campaign not found'; D.errors.push('campaign ' + D.target + ' not found on the Email Bison instance (HTTP ' + (status || '?') + '); nothing was sent');
  } else if (status && (status < 200 || status >= 300)) {
    D.abort = 'campaign check failed'; D.errors.push('GET campaign ' + D.target + ' answered HTTP ' + status + ': ' + JSON.stringify(rb).slice(0, 200) + '; nothing was sent');
  } else {
    D.campName = c.name || D.campName || D.target;
    D.bisonStatus = String(c.status || '');
    D.bisonActive = D.bisonStatus === 'active';
    if (D.bisonStatus === 'archived') { D.abort = 'campaign archived'; D.errors.push('campaign "' + D.campName + '" is archived on Email Bison; nothing was sent'); }
  }
}
const ready = !D.abort && !!p.ready;
return [{ json: { kind: 'create', ready: ready, abort: !!D.abort, body: ready ? p.body : null, wait: 0, target: D.target || '' } }];
