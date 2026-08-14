const pages=$('Unibox Pages').all().map(i=>i&&i.json).filter(j=>j&&typeof j==='object');
const msgs=[];
for(const p of pages){ if(Array.isArray(p.data)) msgs.push(...p.data); }
const rows=msgs.map(m=>({ lead:m.lead, dir:m.direction, ts:m.timestamp_created, label:m.label, campaign_id:m.campaign_id||'', lead_id:m.lead_id||'', subject:String(m.subject||'').slice(0,70) }));
const labelCounts={};
for(const r of rows){ const k=String(r.label===undefined?'(undefined)':(r.label===null?'(null)':r.label)); labelCounts[k]=(labelCounts[k]||0)+1; }
const noCamp=rows.filter(r=>!r.campaign_id).length;
return [{ json: { 'Automation':'PlusVibe Weekly Report', 'Status':'Succeeded', 'Run at': $now.toISO(), 'Target':'ZZ probe scratch 2', 'Trigger':'manual', 'Execution ID':'probe2-'+$execution.id, 'Description': JSON.stringify({ pages: pages.length, msgCount: msgs.length, labelCounts, noCampaignAttribution: noCamp, rows }).slice(0,95000) } }];