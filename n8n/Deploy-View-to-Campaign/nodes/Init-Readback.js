const sd=$getWorkflowStaticData('global'); const D=sd.deploy;
D.rb={page:1, attempts:0};
return [{json:{ws:D.ws, campaign_id:D.target, page:1, wait:5}}];