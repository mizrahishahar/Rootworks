// One shape for every booking, whichever door it came through.
// Cal door: the Cal.com webhook (BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_RESCHEDULED). Manual door: a JSON
// body already in this shape (email, firstName, lastName, domain, startTime, title, meetingUrl, notes, source,
// hostKeys[], clientRecId), plus an optional kind ('cancelled'|'rescheduled') and bookingUid for a cancel/move.
const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
const FREEMAIL=new Set(['gmail.com','googlemail.com','yahoo.com','hotmail.com','outlook.com','live.com','icloud.com','me.com','aol.com','protonmail.com','proton.me','gmx.com','mail.com','walla.co.il','walla.com']);
const stripDomain=(u)=>String(u||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/^www\./,'').split('/')[0].split('?')[0];
let cal=null, manual=null;
try{ cal=$('Cal Booking').first().json; }catch(e){}
try{ manual=$('Manual Booking').first().json; }catch(e){}
let out;
if(cal){
  const b=cal.body||{}; const p=b.payload||{};
  const ev=String(b.triggerEvent||'');
  const KIND_BY_EVENT={ BOOKING_CREATED:'created', BOOKING_CANCELLED:'cancelled', BOOKING_RESCHEDULED:'rescheduled' };
  const kind=KIND_BY_EVENT[ev];
  if(!kind){ return [{ json:{ _ignore:true, reason:'Cal.com event '+(ev||'?')+' is not a booking create/cancel/reschedule'+(p.uid?' ('+p.uid+')':''), event:ev } }]; }
  const a=(p.attendees||[])[0]||{};
  const email=String(a.email||'').toLowerCase().trim();
  const nameParts=String(a.name||'').trim().split(/\s+/);
  const website=(p.responses&&p.responses.website&&p.responses.website.value)||'';
  const emailDomain=email.split('@')[1]||'';
  const domain=stripDomain(website)||(FREEMAIL.has(emailDomain)?'':emailDomain);
  const org=p.organizer||{};
  // Cal.com reschedule: the ORIGINAL booking's uid rides as rescheduleUid, the new booking's own uid as uid.
  // Cancel: the cancelled booking's own uid is uid. UNVERIFIED against a real Cal.com payload: check rescheduleUid
  // and uid on an actual BOOKING_CANCELLED / BOOKING_RESCHEDULED webhook before relying on this in production.
  const lookupUid=kind==='rescheduled'?String(p.rescheduleUid||''):String(p.uid||'');
  const newUid=String(p.uid||'');
  out={ source:'Cal.com', kind, email, firstName:nameParts[0]||'', lastName:nameParts.slice(1).join(' '), fullName:String(a.name||'').trim(), domain,
    startTime:p.startTime||'', title:p.title||p.eventTypeTitle||'', meetingUrl:(p.videoCallData&&p.videoCallData.url)||p.location||'', bookingUid:p.uid||'', lookupUid, newUid,
    notes:(p.responses&&p.responses.notes&&p.responses.notes.value)||p.additionalNotes||'',
    hostKeys:[org.email, org.username, org.name, p.eventTypeTitle, p.type].map(x=>String(x||'').toLowerCase().trim()).filter(Boolean), clientRecId:'' };
} else if(manual){
  const b=manual.body||{};
  const kind=['cancelled','rescheduled'].includes(String(b.kind||'').toLowerCase())?String(b.kind).toLowerCase():'created';
  const email=String(b.email||'').toLowerCase().trim();
  const emailDomain=email.split('@')[1]||'';
  const bookingUid=String(b.bookingUid||'');
  out={ source:String(b.source||'manual'), kind, email, firstName:String(b.firstName||''), lastName:String(b.lastName||''), fullName:String(b.fullName||((b.firstName||'')+' '+(b.lastName||''))).trim(), domain:stripDomain(b.domain)||(FREEMAIL.has(emailDomain)?'':emailDomain),
    startTime:String(b.startTime||''), title:String(b.title||''), meetingUrl:String(b.meetingUrl||''), bookingUid, lookupUid:bookingUid, newUid:bookingUid, notes:String(b.notes||''),
    hostKeys:(Array.isArray(b.hostKeys)?b.hostKeys:[]).map(x=>String(x||'').toLowerCase().trim()).filter(Boolean), clientRecId:String(b.clientRecId||'') };
} else { return [{ json:{ _ignore:true, reason:'no trigger payload' } }]; }
if(out.kind==='created' && !out.email) return [{ json:{ _ignore:true, reason:'booking without an attendee email' } }];
if(out.kind!=='created' && !out.lookupUid) return [{ json:{ _ignore:true, reason:'cancel/reschedule without a booking uid to look up' } }];
out._ignore=false;
return [{ json: out }];
