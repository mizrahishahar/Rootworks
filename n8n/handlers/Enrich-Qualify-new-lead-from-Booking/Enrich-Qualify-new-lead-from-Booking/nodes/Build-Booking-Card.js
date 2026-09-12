const n=$('Normalize Booking').first().json;
const c=$('Resolve Client').first().json;
const p=$('Resolve Prospect').first().json;
let v={}; try{ v=$('Flatten Verdict').first().json||{}; }catch(e){}
// Review period (Operator, 2026-08-23): every booking card goes to the Flowroots replies channel, not the client's channel.
// To hand cards to clients later, swap REVIEW_CHANNEL for c.slackChannel and restore the no-channel guard.
const REVIEW_CHANNEL='C0B8KTG38JX';
const when=n.startTime?new Date(n.startTime).toUTCString():'(time unknown)';
let url='';
if(p.prospectId&&c.dashboardPage){ try{ url='https://airtable.com/appQG6dK0FIOhTxOl/'+c.dashboardPage+'?detail='+Buffer.from(JSON.stringify({pageId:'pagU8C93nMn6vPMTM',rowId:p.prospectId}),'utf8').toString('base64').replace(/=+$/,''); }catch(e){} }
const esc=(s)=>String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const text=[':calendar: *Call booked for '+esc(c.clientName||'?')+'* · '+esc(v.companyName||n.domain||n.fullName),
  '*Who:* '+esc(n.fullName||n.email)+' <'+esc(n.email)+'>'+(n.domain?' · '+esc(n.domain):''),
  '*When:* '+when, n.title?'*What:* '+esc(n.title):'', n.meetingUrl?'*Link:* '+n.meetingUrl:'',
  '*How we got here:* '+esc(p.tier||'Unattributed')+(p.why?' ('+esc(p.why)+')':''),
  v.qualificationStatus?'*Fit:* '+esc(v.qualificationStatus)+(v.verdictReason?' · '+esc(v.verdictReason):''):'',
  v.situation?'*What they want:* '+esc(v.situation):'',
  v.brief?'\n'+v.brief.slice(0,1500):'',
  url?'<'+url+'|Open in pipeline>':''
].filter(Boolean).join('\n');
return [{ json:{ post:true, channel:REVIEW_CHANNEL, text } }];
