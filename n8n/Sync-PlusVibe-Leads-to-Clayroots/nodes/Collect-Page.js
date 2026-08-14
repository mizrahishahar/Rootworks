const sd=$getWorkflowStaticData('global');
const P=sd.pull;
const c=sd.clients[sd.currentClient];
const j=($input.first()||{}).json||{};
const cur=P.queue[P.idx];
const emit=o=>[{json:o}];
const advance=()=>{ P.idx++; P.page=1; P.attempts=0; P.got=0; P.retried=false; P.campStart=Date.now(); if(P.idx<P.queue.length){ const n=P.queue[P.idx]; return emit({ws:n.ws, campaign_id:n.id, page:1, wait:2}); } return emit({done:true, wait:0}); };
if(Date.now()-(P.campStart||Date.now())>900000){
  c.errors.push('time-box: campaign '+cur.id+' exceeded 15 minutes, aborted (page '+P.page+', '+P.got+' leads pulled)');
  c.pullOk=false;
  return advance();
}
const hasWrap=Object.prototype.hasOwnProperty.call(j,'body');
const body=hasWrap?j.body:j;
const status=Number(j.statusCode||0);
let arr=null;
if(Array.isArray(body)) arr=body;
else if(body&&Array.isArray(body.data)) arr=body.data;
else if(body&&Array.isArray(body.leads)) arr=body.leads;
if(status&&(status<200||status>=300)) arr=null;
const nextReq=w=>emit({ws:cur.ws, campaign_id:cur.id, page:P.page, wait:w});
if(arr===null){
  P.attempts++;
  if(P.attempts<=5){
    let w=Math.pow(2,P.attempts);
    const h=j.headers||{};
    const ra=Number(h['retry-after']||h['Retry-After']||0);
    if(ra>0) w=Math.max(w,Math.min(ra,120));
    return nextReq(w);
  }
  c.errors.push('lead pull failed: campaign '+cur.id+' page '+P.page+' after 5 retries (status '+(status||'?')+'): '+JSON.stringify(body).slice(0,200));
  c.pullOk=false;
  return advance();
}
P.attempts=0;
(P.byCampaign[cur.id]=P.byCampaign[cur.id]||[]).push(...arr);
P.got+=arr.length;
if(arr.length===100){
  P.page++;
  if(P.page>500){ c.errors.push('lead pull aborted: campaign '+cur.id+' exceeded 500 pages'); c.pullOk=false; return advance(); }
  return nextReq(2);
}
if(cur.expected!==null&&cur.expected!==undefined&&Number(P.got)!==Number(cur.expected)){
  if(!P.retried){ P.retried=true; P.page=1; P.got=0; P.attempts=0; P.byCampaign[cur.id]=[]; return nextReq(3); }
  c.errors.push('pull-completeness: campaign '+cur.id+' pulled '+P.got+' of expected '+cur.expected+' after full campaign retry');
  c.pullOk=false;
}
return advance();