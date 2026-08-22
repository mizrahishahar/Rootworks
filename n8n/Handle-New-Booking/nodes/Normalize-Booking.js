// One shape for every booking, whichever door it came through.
// Cal door: the Cal.com BOOKING_CREATED webhook. Manual door: a JSON body already in this shape
// (email, firstName, lastName, domain, startTime, title, meetingUrl, notes, source, hostKeys[], clientRecId).
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
  if(ev!=='BOOKING_CREATED'){ return [{ json:{ _ignore:true, reason:'Cal.com event '+(ev||'?')+' is not a new booking'+(p.uid?' ('+p.uid+')':''), event:ev } }]; }
  const a=(p.attendees||[])[0]||{};
  const email=String(a.email||'').toLowerCase().trim();
  const nameParts=String(a.name||'').trim().split(/\s+/);
  const website=(p.responses&&p.responses.website&&p.responses.website.value)||'';
  const emailDomain=email.split('@')[1]||'';
  const domain=stripDomain(website)||(FREEMAIL.has(emailDomain)?'':emailDomain);
  const org=p.organizer||{};
  out={ source:'Cal.com', email, firstName:nameParts[0]||'', lastName:nameParts.slice(1).join(' '), fullName:String(a.name||'').trim(), domain,
    startTime:p.startTime||'', title:p.title||p.eventTypeTitle||'', meetingUrl:(p.videoCallData&&p.videoCallData.url)||p.location||'', bookingUid:p.uid||'',
    notes:(p.responses&&p.responses.notes&&p.responses.notes.value)||p.additionalNotes||'',
    hostKeys:[org.email, org.username, org.name, p.eventTypeTitle, p.type].map(x=>String(x||'').toLowerCase().trim()).filter(Boolean), clientRecId:'' };
} else if(manual){
  const b=manual.body||{};
  const email=String(b.email||'').toLowerCase().trim();
  const emailDomain=email.split('@')[1]||'';
  out={ source:String(b.source||'manual'), email, firstName:String(b.firstName||''), lastName:String(b.lastName||''), fullName:String(b.fullName||((b.firstName||'')+' '+(b.lastName||''))).trim(), domain:stripDomain(b.domain)||(FREEMAIL.has(emailDomain)?'':emailDomain),
    startTime:String(b.startTime||''), title:String(b.title||''), meetingUrl:String(b.meetingUrl||''), bookingUid:String(b.bookingUid||''), notes:String(b.notes||''),
    hostKeys:(Array.isArray(b.hostKeys)?b.hostKeys:[]).map(x=>String(x||'').toLowerCase().trim()).filter(Boolean), clientRecId:String(b.clientRecId||'') };
} else { return [{ json:{ _ignore:true, reason:'no trigger payload' } }]; }
if(!out.email) return [{ json:{ _ignore:true, reason:'booking without an attendee email' } }];
out._ignore=false;
return [{ json: out }];
