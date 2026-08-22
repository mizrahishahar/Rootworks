const n=$('Normalize Booking').first().json;
const c=$('Resolve Client').first().json;
const p=$('Resolve Prospect').first().json;
if(!c.slackChannel) return [];
const when=n.startTime?new Date(n.startTime).toUTCString():'(time unknown)';
let url='';
if(p.prospectId&&c.dashboardPage){ try{ url='https://airtable.com/appQG6dK0FIOhTxOl/'+c.dashboardPage+'?detail='+Buffer.from(JSON.stringify({pageId:'pagU8C93nMn6vPMTM',rowId:p.prospectId}),'utf8').toString('base64').replace(/=+$/,''); }catch(e){} }
const text=[':calendar: *Call booked* ('+n.source+')',
  '*Who:* '+(n.fullName||n.email)+' <'+n.email+'>'+(n.domain?' · '+n.domain:''),
  '*When:* '+when, n.title?'*What:* '+n.title:'', n.meetingUrl?'*Link:* '+n.meetingUrl:'',
  '*CRM:* '+(p.existed?'existing prospect, marked Scheduled Call':'prospect created from the sequencer lead ('+p.why+'), marked Scheduled Call')+(url?' · <'+url+'|open in pipeline>':'')
].filter(Boolean).join('\n');
return [{ json:{ channel:c.slackChannel, text } }];
