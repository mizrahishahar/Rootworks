// The Operator's wake-up reason for a fresh booking: local start time in the prospect's own clock.
// Timezone (Flatten Verdict / the qualifier) has been observed elsewhere in this codebase (Slack BDR Thread,
// Enrich-Qualify-new-lead-from-PlusVibe) as a short abbreviation (ET, CT, IL...), not a full IANA name, despite
// this field being described as an IANA zone name in the build brief. This zmap covers the abbreviations seen
// in that other machine; an unmapped or already-IANA value (contains '/') is used as-is. Verify against a real
// qualifier run before trusting a zone not in this map.
const zmap={ET:'America/New_York',CT:'America/Chicago',MT:'America/Denver',PT:'America/Los_Angeles',AT:'America/Halifax',AKT:'America/Anchorage',HT:'Pacific/Honolulu',IL:'Asia/Jerusalem',GMT:'Europe/London',BST:'Europe/London','GMT/BST':'Europe/London',CET:'Europe/Berlin',CEST:'Europe/Berlin',AEST:'Australia/Sydney',IST:'Asia/Kolkata'};
const n=$('Normalize Booking').first().json;
const p=$('Resolve Prospect').first().json;
let v={}; try{ v=$('Flatten Verdict').first().json||{}; }catch(e){}
const tzRaw=String(v.timezone||'').trim();
const zone=tzRaw.includes('/')?tzRaw:(zmap[tzRaw]||'');
let when=n.startTime||'';
try{ when=zone?DateTime.fromISO(n.startTime).setZone(zone).toFormat('ccc d LLL HH:mm'):DateTime.fromISO(n.startTime).toFormat('ccc d LLL HH:mm'); }catch(e){}
const whenStr=when+(tzRaw?', '+tzRaw:'');
return [{ json:{ recordId:p.prospectId||'', reason:'Meeting booked, '+whenStr+'. The confirmation is owed.' } }];
