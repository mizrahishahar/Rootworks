// Build Feed Stamp: the campaign's own Hub row carries its feeding state, so the manager and the
// Operator read one table. After the run row is written, the campaign row gets Last Fed (this run)
// and Left in View (what the view still held). Only when the view was actually read: a refusal
// before the read leaves the row as it was, so a bad launch never reads as a dry view.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id;
const D = sd[dk] || {};
try { const r = ($input.first() || {}).json || {}; D.runRowId = r.id || ''; } catch (e) {}
if (!D.hubCampaignRid || D.leftInView === undefined || D.leftInView === null) return [{ json: { _none: true } }];
return [{ json: { id: D.hubCampaignRid, 'Left in View': D.leftInView, 'Last Fed': D.runAt || new Date().toISOString() } }];
