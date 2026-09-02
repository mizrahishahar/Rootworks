const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk]; const R=D.rb;
const j=($input.first()||{}).json||{};
const hasWrap=Object.prototype.hasOwnProperty.call(j,'body');
const body=hasWrap?j.body:j;
const status=Number(j.statusCode||0);
let arr=null;
if(Array.isArray(body)) arr=body;
else if(body&&Array.isArray(body.data)) arr=body.data;
else if(body&&Array.isArray(body.leads)) arr=body.leads;
if(status&&(status<200||status>=300)) arr=null;
const emit=o=>[{json:o}];
if(arr===null){
  R.attempts++;
  if(R.attempts<=5){
    let w=Math.pow(2,R.attempts);
    const h=j.headers||{};
    const ra=Number(h['retry-after']||h['Retry-After']||0);
    if(ra>0) w=Math.max(w,Math.min(ra,120));
    return emit({ws:D.ws, campaign_id:D.target, page:R.page, wait:w});
  }
  D.rbFailed=true;
  D.errors.push('read-back failed at page '+R.page+' after 5 retries (status '+(status||'?')+'); unconfirmed rows left unstamped');
  return emit({done:true, wait:0});
}
R.attempts=0;
for(const l of arr){ const e=String(l.email||l.lead_email||'').toLowerCase().trim(); if(e) D.inCamp[e]=1; }
if(arr.length===100){
  R.page++;
  if(R.page>500){ D.rbFailed=true; D.errors.push('read-back aborted: exceeded 500 pages'); return emit({done:true, wait:0}); }
  return emit({ws:D.ws, campaign_id:D.target, page:R.page, wait:2});
}
return emit({done:true, wait:0});