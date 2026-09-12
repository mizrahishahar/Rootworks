const sd=$getWorkflowStaticData('global');
const c=sd.clients[sd.currentClient];
const raw=[];
let sawValidEmpty=false;
let firstSnippet='';
for(const it of $input.all()){
  const j=it.json||{};
  const hasWrap=Object.prototype.hasOwnProperty.call(j,'body');
  const body=hasWrap?j.body:j;
  const status=Number(j.statusCode||0);
  if(!firstSnippet) firstSnippet=JSON.stringify(hasWrap?{statusCode:status, body:body}:j).slice(0,300);
  const ok=!status||(status>=200&&status<300);
  const arr=Array.isArray(body)?body:(body&&Array.isArray(body.campaigns)?body.campaigns:(body&&Array.isArray(body.data)?body.data:((body&&(body.id||body._id))?[body]:null)));
  if(ok&&Array.isArray(arr)){
    for(const x of arr){ if(x&&(x.id||x._id)) raw.push(x); }
    if(!arr.length) sawValidEmpty=true;
  }
  if(hasWrap&&status>=200&&status<300&&body&&typeof body==='object'&&!Array.isArray(body)&&!Object.keys(body).length) sawValidEmpty=true;
}
if(!raw.length){
  if(sawValidEmpty) c.warnings.push('workspace has no campaigns');
  else { c.errors.push('campaign/list-all failed or unrecognized response - failing closed. First response item: '+firstSnippet); c.pullOk=false; }
}
const out=[];
for(const x of raw){
  const id=String(x.id||x._id);
  c.perCampaign[id]={name:x.camp_name||x.name||id, sentCounter:Number(x.sent_count||0), sumSentStep:0, leads:0};
  out.push({json:{campaign_id:id, ws:c.ws, expected:(x.lead_count===undefined||x.lead_count===null)?null:Number(x.lead_count)}});
}
if(!out.length) return [{json:{_none:true}}];
return out;