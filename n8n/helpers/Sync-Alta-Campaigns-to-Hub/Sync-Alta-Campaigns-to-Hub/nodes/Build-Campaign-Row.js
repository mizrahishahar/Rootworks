const c=$('Loop Campaigns').first().json;
let leads=0;
for(const it of $input.all()){ const j=it.json||{}; leads+=(Array.isArray(j.data)?j.data.length:0); }
const sd=$getWorkflowStaticData('global');
sd.altaSync.campaigns.push({name:c.campaignName, leads});
return [{ json: {
  'Campaign': c.campaignName,
  'Campaign ID': c.campaignId,
  'Client': ['reclCOYRBgMowJd8G'],
  'Sequencer': 'Alta',
  'Channel': 'Multi',
  'Status': c.status,
  'Leads': leads,
  'Created': c.launchedAt,
  'Last Synced': $now.toISO()
}}];