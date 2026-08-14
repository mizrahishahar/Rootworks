const sd=$getWorkflowStaticData('global');
sd.weeklyReportResults=[];
const nowIL=$now.setZone('Asia/Jerusalem');
const weekEnd=nowIL.toFormat('yyyy-MM-dd');
const weekStart=nowIL.minus({days:7}).toFormat('yyyy-MM-dd');
const cutoffMs=$now.toMillis()-7*86400000;
const clients=[];
for(const it of $('Get PV Clients').all()){ const j=it.json||{}; const f=j.fields||j; if(!j.id) continue; const ws=String(f['PlusVibe Workspace ID']||'').trim(); if(!ws) continue; clients.push({clientRecId:j.id, clientName:f['Client']||'', slackChannel:String(f['Slack Channel ID']||'').trim(), pvWorkspace:ws}); }
const pAgg={};
for(const it of $('Get All Prospects').all()){ const j=it.json||{}; const f=j.fields||j; if(!j.id) continue; const cl=Array.isArray(f.Client)?f.Client:[]; if(!cl.length) continue; const cid=cl[0]; if(!pAgg[cid]) pAgg[cid]={total:0,positive:0,booked:0,weekNew:0}; const a=pAgg[cid]; a.total++; const st=String(f.OutreachStatus||''); if(st==='Positive Reply') a.positive++; if(st==='Scheduled Call'||st==='No Show'||st==='Call Completed') a.booked++; const fe=f['First Engagement']; if(fe && Date.parse(fe)>=cutoffMs) a.weekNew++; }
const cAgg={};
for(const it of $('Get PV Campaigns').all()){ const j=it.json||{}; const f=j.fields||j; if(!j.id) continue; const cl=Array.isArray(f.Client)?f.Client:[]; if(!cl.length) continue; const cid=cl[0]; if(!cAgg[cid]) cAgg[cid]=[]; cAgg[cid].push({name:f.Campaign||'', contacted:f.Contacted||0, sent:f['Messages Sent']||0, replies:f.Replies||0, positives:f['Positive Replies']||0, replyRate:f['Reply Rate']||''}); }
return clients.map(c=>{ const a=pAgg[c.clientRecId]||{total:0,positive:0,booked:0,weekNew:0}; const camps=cAgg[c.clientRecId]||[]; return { json: Object.assign({}, c, { weekStart, weekEnd, prospectsAllTime:a.total, positiveAllTime:a.positive, callsBooked:a.booked, newLeadsWeek:a.weekNew, campaigns:camps, campCount:camps.length }) }; });