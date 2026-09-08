const j=$input.first().json||{};
const all=j.data||[];
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.altaSync={ totalInWorkspace: all.length, truncated: !!j.hasMore, campaigns: [] };
// Every campaign syncs, whatever its status, archived included. Filtering to active-only froze
// paused campaigns on their last written Status forever (stale-by-omission, found 2026-08-31);
// dropping archived ones did the same to archived campaigns (found 2026-09-06: campaign
// 8089d76f was archived on 09-01, its Hub row kept Status ACTIVE and the Live View ID, and the
// daily feed pushed 600 prospects into it over four days; Alta answers 200 and creates nothing in
// an archived campaign). An archived campaign syncs as STOPPED, an existing Hub choice, so the
// feed (which deploys only Status ACTIVE) stops the day the campaign is archived.
const rows=all.map(c=>({ json: { campaignId:c.id, campaignName:c.name, status: c.isArchived ? 'STOPPED' : String(c.status||'').toUpperCase(), archived: !!c.isArchived, launchedAt:c.launchedAt||c.createdAt||'' } }));
return rows;
