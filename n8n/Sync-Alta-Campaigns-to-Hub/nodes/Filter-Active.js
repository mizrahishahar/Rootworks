const j=$input.first().json||{};
const all=j.data||[];
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.altaSync={ totalInWorkspace: all.length, truncated: !!j.hasMore, campaigns: [] };
// Every non-archived campaign syncs, whatever its status. Filtering to active-only froze
// paused campaigns on their last written Status forever (stale-by-omission, found 2026-08-31).
const active=all.filter(c=>!c.isArchived);
return active.map(c=>({ json: { campaignId:c.id, campaignName:c.name, status:String(c.status||'').toUpperCase(), launchedAt:c.launchedAt||c.createdAt||'' } }));