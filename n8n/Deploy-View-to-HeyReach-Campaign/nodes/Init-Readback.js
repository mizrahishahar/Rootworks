// Init Readback: the proof pass. The campaign's lead list is walked page by page through
// POST campaign/GetLeadsFromCampaign (100 to a page), and a row counts as deployed only when its
// profile URL is in that list. HeyReach's counts say how many, never which; this says which.
// A short wait first so the add has settled on HeyReach's side.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
D.rb = { offset: 0, attempts: 0, pages: 0, total: -1 };
if (!D.pv || !D.pv.sent) return [{ json: { done: true, wait: 0 } }];
return [{ json: { body: { campaignId: Number(D.target), offset: 0, limit: 100 }, wait: 10 } }];
