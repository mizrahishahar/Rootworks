// Which client does this booking belong to? Nothing hardcoded: the registry decides.
// 1. The manual door may name the client outright.
// 2. The booking's host keys (organizer email / username / event title) against each client's Booking Keys lines.
// 3. The attendee's domain against each client's own Email Domains: that is a client meeting, not a lead.
const n=$('Normalize Booking').first().json;
const clients=$input.all().map(it=>it.json).filter(r=>r&&r.id).map(r=>{ const f=r.fields||r; return { id:r.id, f }; });
const lines=(v)=>String(v||'').split('\n').map(s=>s.toLowerCase().trim()).filter(Boolean);
const pick=(c)=>{ const f=c.f; const name=String(f['Client']||''); return { clientRecId:c.id, clientName:name, clientSlug:name.toLowerCase().replace(/[^a-z0-9]/g,''), slackChannel:String(f['Slack Channel ID']||'').trim(), pvWorkspace:String(f['PlusVibe Workspace ID']||'').trim(), dashboardPage:String(f['Dashboard Page ID']||'').trim(), isFlowroots:name.toLowerCase()==='flowroots' }; };
let hit=null, resolution='';
if(n.clientRecId){ hit=clients.find(c=>c.id===n.clientRecId)||null; resolution=hit?'named by the caller':''; }
if(!hit && n.hostKeys && n.hostKeys.length){
  hit=clients.find(c=>lines(c.f['Booking Keys']).some(k=>n.hostKeys.includes(k)))||null;
  if(hit) resolution='host key matched Booking Keys';
}
let clientMeeting=false;
if(!hit && n.domain){
  const own=clients.find(c=>lines(c.f['Email Domains']).includes(n.domain))||null;
  if(own){ hit=own; clientMeeting=true; resolution='attendee domain is the client\'s own domain'; }
}
if(!hit) return [{ json:{ clientRecId:'', clientName:'', clientMeeting:false, resolution:'no client matched host keys '+JSON.stringify(n.hostKeys||[]) } }];
return [{ json: Object.assign(pick(hit), { clientMeeting, resolution }) }];
