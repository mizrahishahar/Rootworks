const sd=$getWorkflowStaticData('global');
const items=$input.all().map(i=>i.json).filter(x=>x&&x.campaign_id);
sd.pull={queue:items.map(x=>({id:String(x.campaign_id), ws:x.ws, expected:(x.expected===undefined?null:x.expected)})), idx:0, page:1, attempts:0, got:0, retried:false, byCampaign:{}, campStart:Date.now()};
if(!sd.pull.queue.length) return [{json:{done:true, wait:0}}];
const f=sd.pull.queue[0];
return [{json:{ws:f.ws, campaign_id:f.id, page:1, wait:0}}];