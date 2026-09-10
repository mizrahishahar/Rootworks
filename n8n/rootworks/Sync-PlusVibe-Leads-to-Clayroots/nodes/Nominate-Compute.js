const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const inFirst=($input.first()||{}).json||{};
const leads=[];
if(!inFirst._none){
  const P=sd.pull||{};
  const by=P.byCampaign||{};
  for(const k of Object.keys(by)){
    for(const l of by[k]){
      if(!l||!(l.email||l.lead_email)) continue;
      leads.push(Object.assign({}, l, {campaign_id:String(l.campaign_id||k)}));
    }
  }
}
const wm=c.watermark?new Date(c.watermark).getTime():null;
const norm=e=>String(e||'').toLowerCase().trim();
const groups={};
let kept=0;
for(const l of leads){
  const em=norm(l.email||l.lead_email); if(!em) continue;
  const cid=String(l.campaign_id||'');
  if(!c.perCampaign[cid]) continue;
  kept++;
  const rec={cid, status:String(l.status||'').toUpperCase(), sent_step:Number(l.sent_step||0), last_sent_at:l.last_sent_at||null, modified_at:l.modified_at||null, replied_count:Number(l.replied_count||0), bounce_msg:String(l.bounce_msg||'')};
  c.perCampaign[cid].sumSentStep+=rec.sent_step;
  c.perCampaign[cid].leads++;
  (groups[em]=groups[em]||[]).push(rec);
}
c.leadsPulled=kept;
const prec={UNSUBSCRIBED:6,BOUNCED:5,REPLIED:4,IN_SEQUENCE:3,COMPLETED:2,NEVER_CONTACTED:1};
const mapStatus=s=>{ if(s==='UNSUBSCRIBED')return 'UNSUBSCRIBED'; if(s==='BOUNCED')return 'BOUNCED'; if(s==='REPLIED')return 'REPLIED'; if(s==='CONTACTED'||s==='PENDING'||s==='RESCHEDULED')return 'IN_SEQUENCE'; if(s==='COMPLETED')return 'COMPLETED'; return 'NEVER_CONTACTED'; };
const runStart=(sd.run||{}).start||$now.toISO();
let nominated=0;
for(const em of Object.keys(groups)){
  const recs=groups[em];
  const nom = wm===null || recs.some(r=> (r.modified_at && new Date(r.modified_at).getTime()>wm) || r.status==='REPLIED' || r.status==='UNSUBSCRIBED');
  if(!nom) continue;
  nominated++;
  let sent=0, last=null, worst='NEVER_CONTACTED', bm='', bmTs=-1;
  const cids=[];
  for(const r of recs){
    sent+=r.sent_step;
    if(r.last_sent_at){ const t=new Date(r.last_sent_at).getTime(); if(!isNaN(t)&&(last===null||t>last)) last=t; }
    const m=mapStatus(r.status); if(prec[m]>prec[worst]) worst=m;
    if(r.bounce_msg){ const t=r.modified_at?new Date(r.modified_at).getTime():0; if(t>=bmTs){ bmTs=t; bm=r.bounce_msg; } }
    if(!cids.includes(r.cid)) cids.push(r.cid);
  }
  c.payloads[em]={'Messages Sent':sent, 'Last Contacted': last===null?null:new Date(last).toISOString(), 'Campaign Status':worst, 'Bounce Reason':bm, 'Campaigns':cids, 'Synced At':runStart};
}
c.nominated=nominated;
const ACCEPTED={'6a5e3dc49b872335dfa3f027':{sum:364, sent:365}, '6a3ad9db3b32b093822e07fb':{sum:1783, sent:1387}, '6a3ad9daf294f74388ea65ac':{sum:4034, sent:3127}};
for(const cid of Object.keys(c.perCampaign)){
  const p=c.perCampaign[cid];
  if(p.sentCounter===null||p.sentCounter===undefined) continue;
  if(Number(p.sumSentStep)===Number(p.sentCounter)) continue;
  const acc=ACCEPTED[cid];
  if(acc && Number(p.sumSentStep)===acc.sum && Number(p.sentCounter)===acc.sent){
    p.accepted=true;
    c.warnings.push('known mismatch (accepted): '+p.name+' '+p.sumSentStep+' vs '+p.sentCounter);
  } else if(acc){
    c.invariantOk=false;
    c.invariant.push(p.name+' ('+cid+'): sum sent_step='+p.sumSentStep+' vs campaign sent='+p.sentCounter+' - DRIFTED beyond accepted '+acc.sum+' vs '+acc.sent);
  } else {
    c.invariantOk=false;
    c.invariant.push(p.name+' ('+cid+'): sum sent_step='+p.sumSentStep+' vs campaign sent='+p.sentCounter);
  }
}
if(sd.pull) sd.pull.byCampaign={};
return [{json:{clientRecId:sd.currentClient, crBase:c.crBase, nominated}}];