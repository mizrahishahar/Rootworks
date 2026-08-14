const j=$input.first().json||{};
const all=j.data||[];
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.altaSync={ totalInWorkspace: all.length, truncated: !!j.hasMore, campaigns: [] };
const active=all.filter(c=>c.status==='active'&&!c.isArchived);
return active.map(c=>({ json: { campaignId:c.id, campaignName:c.name, status:String(c.status||'').toUpperCase(), launchedAt:c.launchedAt||c.createdAt||'' } }));