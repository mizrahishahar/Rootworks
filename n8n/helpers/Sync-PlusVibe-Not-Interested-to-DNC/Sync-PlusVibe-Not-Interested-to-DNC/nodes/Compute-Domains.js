// Compute Domains: the pulled leads become the client's domain set. A lead counts when its label is
// NOT_INTERESTED or its status is UNSUBSCRIBED and its modified_at is at or after the watermark (no
// modified_at: kept). One lead per email+campaign. The domain is the part after @; free-mail
// providers (gmail, yahoo, outlook, hotmail, icloud, aol, proton) are counted and skipped, never
// blocked. Per domain the Notes lines are kept: campaign name, lead email, why. Domains are chunked
// (200 per call) for the blocklist leg. Nothing to add: a counted skip and straight to Close Client.
const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const R=sd.run||{};
const FREE=new Set(['gmail','googlemail','yahoo','outlook','hotmail','icloud','aol','proton','protonmail']);
const wm=Number(R.watermarkMs||0);
const seen={};
for(const l of ((sd.pull&&sd.pull.leads)||[])){
  const isNI=l.label==='NOT_INTERESTED';
  const isUn=l.status==='UNSUBSCRIBED';
  if(!isNI&&!isUn) continue;
  const t=l.modified_at?Date.parse(l.modified_at):NaN;
  if(wm&&!isNaN(t)&&t<wm){ c.beforeWatermark++; continue; }
  const key=l.email+'|'+l.campaign_id;
  if(seen[key]) continue;
  seen[key]=1;
  c.leadsRead++;
  if(isNI) c.notInterested++; else c.unsubscribed++;
  const dom=String(l.email.split('@')[1]||'').toLowerCase().trim();
  if(!dom||dom.indexOf('.')<0){ c.noDomain++; continue; }
  if(FREE.has(dom.split('.')[0])){ c.freeMail++; continue; }
  const d=c.domains[dom]=c.domains[dom]||{ emails:[], notes:[] };
  if(d.emails.indexOf(l.email)<0) d.emails.push(l.email);
  const line=(l.camp||'(no campaign name)')+' · '+l.email+' · '+(isNI?'Not interested':'Unsubscribed');
  if(d.notes.indexOf(line)<0) d.notes.push(line);
}
sd.pull=null;
const domains=Object.keys(c.domains);
c.domainCount=domains.length;
if(!domains.length){
  c.skips.push('nothing to add ('+c.leadsRead+' leads in scope, '+c.freeMail+' free-mail, '+c.beforeWatermark+' before the watermark)');
  return [{ json:{ _none:true } }];
}
const chunks=[];
for(let i=0;i<domains.length;i+=200) chunks.push(domains.slice(i,i+200));
sd.block={ queue:chunks, idx:0, currentCount:0 };
return [{ json:{ clientRecId:sd.currentClient, ws:c.ws, crBase:c.crBase, dncTableId:c.dncTableId, domains:domains.length } }];
