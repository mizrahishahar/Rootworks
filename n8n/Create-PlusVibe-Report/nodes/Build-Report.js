const cw=$('Loop Over Clients').first().json;
const sd=$getWorkflowStaticData('global');
if(!Array.isArray(sd.weeklyReportResults)) sd.weeklyReportResults=[];
const num=(v)=>{ if(typeof v==='number') return v; const n=parseInt(v,10); return isNaN(n)?0:n; };
const pvItems=$('PV Weekly Stats').all().map(i=>i&&i.json).filter(j=>j&&typeof j==='object');
let sentWeek=0, contactedWeek=0, parsedCounts=false, pvErr='';
const listRows=[];
for(const d of pvItems){ if(d.new_leads_contacted!==undefined||d.total_emails_sent!==undefined){ parsedCounts=true; sentWeek+=num(d.total_emails_sent); contactedWeek+=num(d.new_leads_contacted); } else if(d.camp_name!==undefined){ listRows.push(d); } else if(d.error||d.message){ const s=JSON.stringify(d); if(s.indexOf('Campaign not found')>=0){ parsedCounts=true; } else { pvErr+=(pvErr?' | ':'')+'PV: '+s.slice(0,200); } } }
if(!parsedCounts && !pvErr){ pvErr='PV weekly counts missing'; }
const inWin=(ds)=> ds>=cw.weekStart && ds<=cw.weekEnd;
const launchedWeek=listRows.filter(c=>{ const st=String(c.camp_st_date||c.created_at||'').slice(0,10); return st && inWin(st); }).length;
const campaignsAllTime=listRows.length||cw.hubCampCount||0;
const sentAll=listRows.length ? listRows.reduce((s,c)=>s+num(c.sent_count),0) : (cw.hubSentAll||0);
const contactedAll=listRows.length ? listRows.reduce((s,c)=>s+num(c.lead_contacted_count),0) : (cw.hubContactedAll||0);
const repliesAll=listRows.length ? listRows.reduce((s,c)=>s+num(c.replied_count),0) : (cw.hubRepliesAll||0);
let repliesWeek=0, autoRepliesWeek=0, uniboxTruncated=false, uniboxErrPages=0;
try{
 const pages=$('PV Unibox Received').all().map(i=>i&&i.json).filter(j=>j&&typeof j==='object');
 const msgs=[];
 for(const p of pages){ if(Array.isArray(p.data)){ msgs.push(...p.data); } else if(p.error||p.message){ uniboxErrPages++; } }
 if(uniboxErrPages && !msgs.length){ pvErr+=(pvErr?' | ':'')+'PV unibox: all '+uniboxErrPages+' page(s) failed'; }
 const startMs=Date.parse(cw.weekStart+'T00:00:00+03:00');
 // Daily reports cover a closed calendar day: weekEnd = weekStart = yesterday, so the window ends at today 00:00.
 const endMs=cw.daily ? Date.parse(cw.weekEnd+'T00:00:00+03:00')+86400000 : Infinity;
 const humans=new Set(); const autos=new Set(); let oldestMs=Infinity;
 for(const m of msgs){ const t=Date.parse(m.timestamp_created||m.sent_on||''); if(isNaN(t)) continue; if(t<oldestMs) oldestMs=t; if(String(m.direction||'').toUpperCase()!=='IN') continue; if(!m.campaign_id||!m.lead_id) continue; if(t<startMs||t>=endMs) continue; const lead=String(m.lead||m.lead_id||'').toLowerCase(); const lbl=String(m.label||'').toUpperCase(); if(lbl==='AUTOMATIC_REPLY'||lbl==='OUT_OF_OFFICE'){ autos.add(lead); } else { humans.add(lead); } }
 repliesWeek=humans.size;
 autoRepliesWeek=autos.size;
 if(msgs.length && oldestMs>=startMs && (pages.length>=40 || uniboxErrPages)) uniboxTruncated=true;
}catch(e){ pvErr+=(pvErr?' | ':'')+'unibox read: '+String(e).slice(0,150); }
const posWeek=cw.newLeadsWeek;
const bookedWeek=cw.callsBookedWeek||0;
const daily=cw.daily===true;
const kind=daily?'Daily':'Weekly';
const periodTitle=daily?'Yesterday':'This week';
const periodLine=daily?cw.weekEnd:(cw.weekStart+' to '+cw.weekEnd);
const labels=['Campaigns launched','Emails sent','Prospects contacted','Replies','Positive replies','Calls booked'];
const weekVals=[launchedWeek, sentWeek, contactedWeek, repliesWeek, posWeek, bookedWeek];
const allVals=[campaignsAllTime, sentAll, contactedAll, repliesAll, cw.positiveAllTime||0, cw.callsBooked||0];
const campLines=(cw.campaigns&&cw.campaigns.length)?cw.campaigns.map(c=>'- **'+c.name+':** '+c.contacted+' contacted, '+c.sent+' emails, '+c.replies+' replies'+(c.replyRate?' ('+c.replyRate+')':'')+', '+c.positives+' positive'):['- No campaigns synced yet'];
const md=['# '+kind+' Report: '+cw.clientName,'**'+(daily?'Day':'Week')+':** '+periodLine,'','## '+periodTitle].concat(labels.map((l,i)=>'- **'+l+':** '+weekVals[i])).concat(['','## All time']).concat(labels.map((l,i)=>'- **'+l+':** '+allVals[i])).concat(['','## Campaigns (lifetime)']).concat(campLines).join('\n');
const bullets=(vals)=>labels.map((l,i)=>'• '+l+': *'+vals[i]+'*').join('\n');
const head='📊 *'+kind+' Report: '+cw.clientName+'*\n_'+periodLine+'_';
const blocks=[{type:'section',text:{type:'mrkdwn',text:head}},{type:'divider'},{type:'section',text:{type:'mrkdwn',text:'*'+periodTitle+'*\n'+bullets(weekVals)}},{type:'section',text:{type:'mrkdwn',text:'*All time*\n'+bullets(allVals)}}];
sd.weeklyReportResults.push({client:cw.clientName, reportDay:cw.reportDay, sentWeek, contactedWeek, repliesWeek, autoRepliesWeek, launchedWeek, newLeads:posWeek, bookedWeek, excluded:cw.excludedNonPV||0, ok:!pvErr, pvErr, noChannel:!cw.slackChannel, truncated:uniboxTruncated, errPages:uniboxErrPages});
return [{ json: { 'Name': cw.clientName+(daily?' - Daily '+cw.weekEnd:' - Week of '+cw.weekStart), 'Type': kind, 'Client': [cw.clientRecId], 'Week Start': cw.weekStart, 'Week End': cw.weekEnd, 'Campaigns Launched (Week)': launchedWeek, 'Emails Sent (Week)': sentWeek, 'Prospects Contacted (Week)': contactedWeek, 'Replies (Week)': repliesWeek, 'Positive Replies (Week)': posWeek, 'Calls Booked (Week)': bookedWeek, 'Campaigns All-Time': campaignsAllTime, 'Emails Sent All-Time': sentAll, 'Prospects Contacted All-Time': contactedAll, 'Replies All-Time': repliesAll, 'Prospects All-Time': cw.prospectsAllTime||0, 'Positive Replies All-Time': cw.positiveAllTime||0, 'Calls Booked All-Time': cw.callsBooked||0, 'Report': md, blocksJson: JSON.stringify({blocks}), slackChannel: cw.slackChannel, clientName: cw.clientName } }];
