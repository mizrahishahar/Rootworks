// The Operator's wake-up reason for a cancel or a move. Cancel needs no time; reschedule renders the new
// start time in the prospect's own clock. Same abbreviation-vs-IANA caveat as Build-Wake-Reason.js: verify
// Timezone's real shape against a live qualifier run.
const zmap={ET:'America/New_York',CT:'America/Chicago',MT:'America/Denver',PT:'America/Los_Angeles',AT:'America/Halifax',AKT:'America/Anchorage',HT:'Pacific/Honolulu',IL:'Asia/Jerusalem',GMT:'Europe/London',BST:'Europe/London','GMT/BST':'Europe/London',CET:'Europe/Berlin',CEST:'Europe/Berlin',AEST:'Australia/Sydney',IST:'Asia/Kolkata'};
const n=$('Normalize Booking').first().json;
let rp={}; try{ rp=$('Read Changed Prospect').first().json||{}; }catch(e){}
const recordId=rp.prospectId||'';
const kind=n.kind;
let reason;
if(kind==='cancelled'){
  reason='Meeting cancelled. A response with two new times is owed.';
} else {
  const tzRaw=String(rp.timezone||'').trim();
  const zone=tzRaw.includes('/')?tzRaw:(zmap[tzRaw]||'');
  let when=n.startTime||'';
  try{ when=zone?DateTime.fromISO(n.startTime).setZone(zone).toFormat('ccc d LLL HH:mm'):DateTime.fromISO(n.startTime).toFormat('ccc d LLL HH:mm'); }catch(e){}
  const whenStr=when+(tzRaw?', '+tzRaw:'');
  reason='Meeting moved to '+whenStr+'. A short acknowledgement is owed.';
}
return [{ json:{ recordId, reason } }];
