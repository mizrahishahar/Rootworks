// Check HR Campaign: the target must exist in the client's HeyReach workspace, proven by
// GET campaign/GetById, before a single lead is sent. The Hub row is only the description of a
// campaign, not proof that it is there. The name HeyReach itself carries wins for the run log and
// the receipt. AddLeadsToCampaignV2 refuses a campaign that is not running (a DRAFT, or one that
// FINISHED or was CANCELED), so those are refused here by name, with the status in the log; any
// other status is left for the add call itself to judge, and its answer is recorded verbatim.
// A campaign with no LinkedIn sender attached cannot take leads either; refused here too.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
const p = $('Load State').first().json;
if (!D.abort) {
  const j = ($input.first() || {}).json || {};
  const hasWrap = Object.prototype.hasOwnProperty.call(j, 'body');
  const rb = hasWrap ? j.body : j;
  const status = Number(j.statusCode || 0);
  const c = rb && typeof rb === 'object' && !Array.isArray(rb) ? rb : null;
  if (j.error && !hasWrap && !status) {
    D.abort = 'campaign check failed'; D.errors.push('GET campaign ' + D.target + ' errored before a response: ' + String(j.error).slice(0, 200) + '; nothing was sent');
  } else if (status === 401 || status === 403) {
    D.abort = 'HeyReach key refused'; D.errors.push('HeyReach answered HTTP ' + status + ' to the campaign check: the HeyReach API Key on the registry row is wrong or revoked; nothing was sent');
  } else if (status === 404 || !c || String(c.id) !== String(D.target)) {
    D.abort = 'campaign not found'; D.errors.push('campaign ' + D.target + ' not found in the client\'s HeyReach workspace (HTTP ' + (status || '?') + '); nothing was sent');
  } else if (status && (status < 200 || status >= 300)) {
    D.abort = 'campaign check failed'; D.errors.push('GET campaign ' + D.target + ' answered HTTP ' + status + ': ' + JSON.stringify(rb).slice(0, 200) + '; nothing was sent');
  } else {
    D.campName = c.name || D.campName || D.target;
    D.hrStatus = String(c.status || '');
    const accounts = Array.isArray(c.campaignAccountIds) ? c.campaignAccountIds : (Array.isArray(c.linkedInAccountIds) ? c.linkedInAccountIds : null);
    D.hrSenders = accounts ? accounts.length : -1;
    if (/^(DRAFT|FINISHED|CANCELED|CANCELLED)$/i.test(D.hrStatus)) { D.abort = 'campaign not running'; D.errors.push('campaign "' + D.campName + '" is ' + D.hrStatus + ' on HeyReach; AddLeadsToCampaignV2 only feeds a running campaign. Nothing was sent'); }
    else if (accounts && !accounts.length) { D.abort = 'campaign has no senders'; D.errors.push('campaign "' + D.campName + '" has no LinkedIn sender attached on HeyReach; nothing was sent'); }
  }
}
const ready = !D.abort && !!p.ready;
return [{ json: { ready: ready, abort: !!D.abort, body: ready ? p.body : null, wait: 0, target: D.target || '' } }];
