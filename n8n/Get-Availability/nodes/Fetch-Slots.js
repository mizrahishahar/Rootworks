// Turns the client's Scheduling Link into open slots. The link decides the scheduler; nothing is configured per client.
// Recipes proven by curl 2026-08-22: Cal.com v2 slots, Calendly booking API (scheduling_links -> share_uuid -> calendar/range),
// HubSpot meetings-public availability-page (needs Origin/Referer of the meetings host).
const inp=$('Inputs').first().json;
const rec=$input.first().json||{};
const f=rec.fields||rec;
const clientName=String(f['Client']||'').trim();
if(!rec.id||!clientName) return [{ json:{ ok:false, client:inp.client, error:'client not found in the registry: '+inp.client, slots:[], count:0 } }];
const link=String(f['Scheduling Link']||'').trim();
if(!link) return [{ json:{ ok:false, client:clientName, error:'the registry row has no Scheduling Link', slots:[], count:0 } }];
const tz=inp.timezone; const days=inp.days; const max=inp.max;
const now=DateTime.now().setZone(tz);
const notBefore=now.plus({hours:2});
const end=now.plus({days});
const fmt=(dt)=>dt.setZone(tz).toFormat('ccc d LLL, HH:mm');
const get=async(url,headers)=>{ return await this.helpers.httpRequest({ method:'GET', url, headers:Object.assign({'Accept':'application/json','User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'},headers||{}), json:true, timeout:20000 }); };
// The Code sandbox has no URL class; parse host and path by hand.
const um=link.match(/^https?:\/\/([^/?#]+)([^?#]*)/i);
if(!um) return [{ json:{ ok:false, client:clientName, link, error:'Scheduling Link is not a URL', slots:[], count:0 } }];
const host=um[1].toLowerCase(); const parts=um[2].split('/').filter(Boolean);
let scheduler='', starts=[], duration=null, note='';
try{
  if(host.endsWith('cal.com')){
    scheduler='Cal.com';
    const [user,slug]=parts;
    const r=await get('https://api.cal.com/v2/slots?username='+encodeURIComponent(user)+'&eventTypeSlug='+encodeURIComponent(slug||'')+'&start='+now.toISODate()+'&end='+end.toISODate()+'&timeZone='+encodeURIComponent(tz), {'cal-api-version':'2024-09-04'});
    const data=(r&&r.data)||{};
    for(const d of Object.keys(data)) for(const s of (data[d]||[])) if(s&&s.start) starts.push(DateTime.fromISO(s.start));
  } else if(host.endsWith('calendly.com')){
    scheduler='Calendly';
    let et=null;
    if(parts[0]==='d' && parts[1]){
      const sl=await get('https://calendly.com/api/booking/scheduling_links/'+encodeURIComponent(parts[1]));
      const q=sl&&sl.owner_type==='Share'?('share_uuid='+encodeURIComponent(sl.owner_uuid)):('event_type_uuid='+encodeURIComponent(sl&&sl.owner_uuid||''));
      et=await get('https://calendly.com/api/booking/event_types/lookup?'+q);
      et._link_code=parts[1];
    } else {
      et=await get('https://calendly.com/api/booking/event_types/lookup?profile_slug='+encodeURIComponent(parts[0]||'')+'&event_type_slug='+encodeURIComponent(parts[1]||''));
    }
    if(!et||!et.uuid) throw new Error('Calendly event type not resolved from '+link);
    duration=et.duration||null;
    const ctz=et.availability_timezone||tz;
    for(let d0=now.startOf('day'); d0<end; d0=d0.plus({days:7})){
      const d1=DateTime.min(d0.plus({days:6}), end);
      const r=await get('https://calendly.com/api/booking/event_types/'+et.uuid+'/calendar/range?timezone='+encodeURIComponent(ctz)+'&diagnostics=false&range_start='+d0.toISODate()+'&range_end='+d1.toISODate()+(et._link_code?'&scheduling_link_uuid='+encodeURIComponent(et._link_code):''));
      for(const day of ((r&&r.days)||[])) for(const s of (day.spots||[])) if(s&&s.status==='available'&&s.start_time) starts.push(DateTime.fromISO(s.start_time));
    }
  } else if(host.includes('hubspot.com')){
    scheduler='HubSpot Meetings';
    const m=host.match(/^meetings(?:-([a-z0-9]+))?\.hubspot\.com$/); const hublet=(m&&m[1])||'';
    const api=hublet?('https://api-'+hublet+'.hubspot.com'):'https://api.hubspot.com';
    const slug=parts.join('/');
    const months=Math.max(1, Math.ceil(days/28));
    const byDur={};
    for(let mo=0; mo<months; mo++){
      const r=await get(api+'/meetings-public/v3/book/availability-page?slug='+encodeURIComponent(slug)+'&monthOffset='+mo+'&timezone='+encodeURIComponent(tz)+'&hs_static_app=MeetingsPublic&hs_static_app_version=1.60896', {'Origin':'https://'+host,'Referer':'https://'+host+'/'});
      const bd=((r||{}).linkAvailability||{}).linkAvailabilityByDuration||{};
      for(const k of Object.keys(bd)){ byDur[k]=(byDur[k]||[]).concat(bd[k].availabilities||[]); }
    }
    const keys=Object.keys(byDur).map(Number).sort((a,b)=>a-b);
    if(keys.length){ duration=keys[0]/60000; for(const a of byDur[String(keys[0])]) starts.push(DateTime.fromMillis(a.startMillisUtc)); if(keys.length>1) note='durations offered: '+keys.map(k=>k/60000+' min').join(', ')+'; slots shown for '+duration+' min'; }
  } else {
    return [{ json:{ ok:false, client:clientName, link, error:'unknown scheduler host '+host, slots:[], count:0 } }];
  }
}catch(e){
  return [{ json:{ ok:false, client:clientName, scheduler, link, error:String(e&&e.message||e).slice(0,300), slots:[], count:0 } }];
}
const seen=new Set();
const slots=starts.filter(d=>d.isValid&&d>notBefore&&d<end).map(d=>d.setZone(tz)).sort((a,b)=>a-b).filter(d=>{ const k=d.toISO(); if(seen.has(k)) return false; seen.add(k); return true; }).slice(0,max).map(d=>({ start:d.toISO(), label:fmt(d), weekday:d.toFormat('cccc') }));
return [{ json:{ ok:true, client:clientName, scheduler, link, timezone:tz, duration_minutes:duration, days, slots, count:slots.length, note:note||(slots.length?'':'no open slots in the window') } }];
