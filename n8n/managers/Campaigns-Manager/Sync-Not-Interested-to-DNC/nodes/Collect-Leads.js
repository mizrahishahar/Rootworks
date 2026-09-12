// Collect Leads: one page of workspace-leads in, the next request out. Keeps only what the machine
// needs per lead (email, label, status, modified_at, campaign name). A failed page retries up to five
// times with backoff (Retry-After honored); after that the pull is an error line and the next read
// starts. A full page asks for the next page; a short page advances to the next read; the last read
// emits done. A 15-minute time-box per client aborts the pull as an error.
const sd=$getWorkflowStaticData('global');
const P=sd.pull;
const c=sd.clients[sd.currentClient];
const j=($input.first()||{}).json||{};
const cur=P.queue[P.idx];
const url=(q,page)=>'https://api.plusvibe.ai/api/v1/lead/workspace-leads?workspace_id='+encodeURIComponent(c.ws)+'&'+q.key+'='+q.value+'&limit='+P.limit+'&page='+page;
const emit=o=>[{ json:o }];
const advance=()=>{ P.idx++; P.page=1; P.attempts=0; if(P.idx<P.queue.length) return emit({ pvUrl:url(P.queue[P.idx],1), wait:1 }); return emit({ done:true, wait:0 }); };
if(Date.now()-(P.started||Date.now())>900000){
  c.errors.push('time-box: the lead pull exceeded 15 minutes ('+cur.key+'='+cur.value+', page '+P.page+'), aborted');
  return emit({ done:true, wait:0 });
}
const hasWrap=Object.prototype.hasOwnProperty.call(j,'body');
const body=hasWrap?j.body:j;
const status=Number(j.statusCode||0);
let arr=null;
if(Array.isArray(body)) arr=body;
else if(body&&Array.isArray(body.data)) arr=body.data;
else if(body&&Array.isArray(body.leads)) arr=body.leads;
if(status&&(status<200||status>=300)) arr=null;
if(arr===null){
  P.attempts++;
  if(P.attempts<=5){
    let w=Math.pow(2,P.attempts);
    const h=j.headers||{};
    const ra=Number(h['retry-after']||h['Retry-After']||0);
    if(ra>0) w=Math.max(w,Math.min(ra,120));
    return emit({ pvUrl:url(cur,P.page), wait:w });
  }
  c.errors.push('lead pull failed: '+cur.key+'='+cur.value+' page '+P.page+' after 5 retries (status '+(status||'?')+'): '+JSON.stringify(body).slice(0,200));
  return advance();
}
P.attempts=0;
for(const l of arr){
  if(!l||!(l.email||l.lead_email)) continue;
  P.leads.push({ email:String(l.email||l.lead_email).toLowerCase().trim(), label:String(l.label||'').toUpperCase(), status:String(l.status||'').toUpperCase(), modified_at:l.modified_at||null, camp:String(l.camp_name||l.campaign_name||''), campaign_id:String(l.campaign_id||'') });
}
c.leadsPulled+=arr.length;
if(arr.length>=P.limit){
  P.page++;
  if(P.page>100){ c.errors.push('lead pull aborted: '+cur.key+'='+cur.value+' exceeded 100 pages of '+P.limit); return advance(); }
  return emit({ pvUrl:url(cur,P.page), wait:1 });
}
return advance();
