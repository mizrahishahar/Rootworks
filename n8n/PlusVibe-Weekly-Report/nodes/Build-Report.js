const cw=$('Loop Over Clients').first().json;
const sd=$getWorkflowStaticData('global');
if(!Array.isArray(sd.weeklyReportResults)) sd.weeklyReportResults=[];
const num=(v)=>{ if(typeof v==='number') return v; const n=parseInt(v,10); return isNaN(n)?0:n; };
const items=$input.all().map(i=>i&&i.json).filter(j=>j&&typeof j==='object');
let sentWeek=0, repliesWeek=0, contactedWeek=0, parsed=false, pvErr='';
for(const d of items){ if(d.campaign_id!==undefined || d.total_emails_sent!==undefined){ parsed=true; sentWeek+=num(d.total_emails_sent); repliesWeek+=num(d.leads_replied); contactedWeek+=num(d.new_leads_contacted); } }
if(!parsed){ const s=JSON.stringify(items[0]||{}); if(s.indexOf('Campaign not found')>=0){ parsed=true; } else { pvErr='PV weekly analytics response not understood: '+s.slice(0,400); } }
const campLines=(cw.campaigns&&cw.campaigns.length)?cw.campaigns.map(c=>'- **'+c.name+':** '+c.contacted+' contacted, '+c.sent+' emails, '+c.replies+' replies'+(c.replyRate?' ('+c.replyRate+')':'')+', '+c.positives+' positive'):['- No campaigns synced yet'];
const md=['# Weekly Report: '+cw.clientName,'**Week:** '+cw.weekStart+' to '+cw.weekEnd,'','## This week','- **Emails sent:** '+sentWeek,'- **New prospects contacted:** '+contactedWeek,'- **Replies:** '+repliesWeek,'- **New interested leads:** '+cw.newLeadsWeek,'','## All time','- **Prospects in play:** '+cw.prospectsAllTime,'- **Positive replies:** '+cw.positiveAllTime,'- **Calls booked:** '+cw.callsBooked,'','## Campaigns (lifetime)'].concat(campLines).join('\n');
const head='📊 *Weekly Report: '+cw.clientName+'*\n_'+cw.weekStart+' to '+cw.weekEnd+'_';
const thisWeek='*This week*\n• Emails sent: *'+sentWeek+'*\n• New prospects contacted: *'+contactedWeek+'*\n• Replies: *'+repliesWeek+'*\n• New interested leads: *'+cw.newLeadsWeek+'*';
const allTime='*All time*\n• Prospects in play: *'+cw.prospectsAllTime+'*\n• Positive replies: *'+cw.positiveAllTime+'*'+(cw.callsBooked?'\n• Calls booked: *'+cw.callsBooked+'*':'')+'\n• Campaigns: *'+cw.campCount+'*';
const blocks=[{type:'section',text:{type:'mrkdwn',text:head}},{type:'divider'},{type:'section',text:{type:'mrkdwn',text:thisWeek}},{type:'section',text:{type:'mrkdwn',text:allTime}}];
sd.weeklyReportResults.push({client:cw.clientName, sentWeek, repliesWeek, contactedWeek, newLeads:cw.newLeadsWeek, ok:!pvErr, pvErr, noChannel:!cw.slackChannel});
return [{ json: { 'Name': cw.clientName+' - Week of '+cw.weekStart, 'Client': [cw.clientRecId], 'Week Start': cw.weekStart, 'Week End': cw.weekEnd, 'Emails Sent (Week)': sentWeek, 'Replies (Week)': repliesWeek, 'Positive Replies (Week)': cw.newLeadsWeek, 'Prospects All-Time': cw.prospectsAllTime, 'Positive Replies All-Time': cw.positiveAllTime, 'Report': md, blocksJson: JSON.stringify({blocks}), slackChannel: cw.slackChannel, clientName: cw.clientName } }];