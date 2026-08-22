const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.weeklyReportResults=[];
const nowIL=$now.setZone('Asia/Jerusalem');
const todayName=nowIL.toFormat('cccc');
const isTest=$execution.mode!=='production';
// A launched run (Hub launch row) reports regardless of Report Day; with a Client on the row, that client only.
const launch=sd.launch||{};
const launched=!!launch.recordId;
const cf=String(launch.clientFilter||'');
sd.syncScope=cf?'one client (on demand, Report Day ignored)':(launched?'all PV clients (on demand, Report Day ignored)':'all clients due today');
const weekEnd=nowIL.toFormat('yyyy-MM-dd');
const weekStart=nowIL.minus({days:7}).toFormat('yyyy-MM-dd');
const cutoffMs=$now.toMillis()-7*86400000;
const clients=[];
for(const it of $('Get PV Clients').all()){ const j=it.json||{}; const f=j.fields||j; if(!j.id) continue; if(cf && j.id!==cf) continue; const ws=String(f['PlusVibe Workspace ID']||'').trim(); if(!ws) continue; let rd=f['Report Day']; if(rd&&typeof rd==='object') rd=rd.name; rd=String(rd||'').trim(); const due=isTest||launched||(rd?rd===todayName:todayName==='Friday'); if(!due) continue; clients.push({clientRecId:j.id, clientName:f['Client']||'', slackChannel:String(f['Slack Channel ID']||'').trim(), pvWorkspace:ws, reportDay:rd||'Friday'}); }
const pvSet=new Set();
for(const it of $('Get PV Campaigns').all()){ const j=it.json||{}; if(j.id) pvSet.add(j.id); }
const toId=(c)=> typeof c==='string'?c:((c&&c.id)||'');
const pAgg={};
for(const it of $('Get All Prospects').all()){ const j=it.json||{}; const f=j.fields||j; if(!j.id) continue; const cl=Array.isArray(f.Client)?f.Client.map(toId):[]; if(!cl.length) continue; const cid=cl[0]; if(!pAgg[cid]) pAgg[cid]={total:0,positive:0,booked:0,bookedWeek:0,weekNew:0,excluded:0};
 const camps=Array.isArray(f.Campaigns)?f.Campaigns.map(toId).filter(Boolean):[];
 const altaId=String(f['Alta Prospect ID']||'').trim();
 const isPV = camps.length ? camps.some(id=>pvSet.has(id)) : !altaId;
 if(!isPV){ pAgg[cid].excluded++; continue; }
 const a=pAgg[cid]; a.total++;
 const st=String(f.OutreachStatus&&f.OutreachStatus.name?f.OutreachStatus.name:(f.OutreachStatus||''));
 const prl=(f['Positive Reply Lead']===true);
 if(prl) a.positive++;
 if(st==='Scheduled Call'||st==='No Show'||st==='Call Completed') a.booked++;
 const fe=f['First Engagement'];
 if(prl && fe && Date.parse(fe)>=cutoffMs) a.weekNew++;
 const cb=f['Call Booked At'];
 if(cb && Date.parse(cb)>=cutoffMs) a.bookedWeek++; }
const cAgg={};
for(const it of $('Get PV Campaigns').all()){ const j=it.json||{}; const f=j.fields||j; if(!j.id) continue; const cl=Array.isArray(f.Client)?f.Client.map(toId):[]; if(!cl.length) continue; const cid=cl[0]; if(!cAgg[cid]) cAgg[cid]={list:[],sent:0,contacted:0,replies:0}; const a=cAgg[cid]; const row={name:f.Campaign||'', contacted:f.Contacted||0, sent:f['Messages Sent']||0, replies:f.Replies||0, positives:f['Positive Replies']||0, replyRate:f['Reply Rate']||''}; a.list.push(row); a.sent+=row.sent; a.contacted+=row.contacted; a.replies+=row.replies; }
// Nothing to loop over: emit one placeholder so the Any Clients? gate can route straight to the run log.
if(!clients.length) return [{ json: { _empty:true } }];
return clients.map(c=>{ const a=pAgg[c.clientRecId]||{total:0,positive:0,booked:0,bookedWeek:0,weekNew:0,excluded:0}; const cg=cAgg[c.clientRecId]||{list:[],sent:0,contacted:0,replies:0}; return { json: Object.assign({}, c, { weekStart, weekEnd, prospectsAllTime:a.total, positiveAllTime:a.positive, callsBooked:a.booked, callsBookedWeek:a.bookedWeek, newLeadsWeek:a.weekNew, excludedNonPV:a.excluded, campaigns:cg.list, hubCampCount:cg.list.length, hubSentAll:cg.sent, hubContactedAll:cg.contacted, hubRepliesAll:cg.replies }) }; });