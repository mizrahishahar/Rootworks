// Init Readback: the proof pass. Every id created this run is read back one by one from
// GET /api/leads/{id}, and a lead counts as deployed only when its lead_campaign_data names this
// campaign. Bison caches attach-leads on an ACTIVE campaign and syncs every five minutes, so on an
// active campaign the first read waits 320 seconds; a paused or draft campaign attaches at once.
// Bison lists are 15 to a page with no page-size control, which is why the read-back is by id and
// never a walk of the campaign.
const sd = $getWorkflowStaticData('global'); const dk = 'deploy_' + $execution.id; const D = sd[dk];
const ids = D.bisonIds || [];
D.rb = { idx: 0, attempts: 0 };
if (!ids.length) return [{ json: { done: true, wait: 0 } }];
return [{ json: { lead_id: ids[0].id, wait: D.bisonActive ? 320 : 5 } }];
