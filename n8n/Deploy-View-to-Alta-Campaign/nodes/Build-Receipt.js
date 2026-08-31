// Build Receipt: the Lead Lists row, one per view+campaign, refreshed by every run of this
// door (a daily feed hits the same row forever, zero new rows). List URL is the client-safe
// share link from the table description; View Link the internal deep link to the selector.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{_none:true}}]; }
let hubId=D.hubCampaignRid||'';
const name=(D.tableName||D.tableId||'table')+' - '+(D.view||'view');
const internal=(D.shareViewLink&&D.tableId&&D.viewId)?(D.shareViewLink+'/'+D.tableId+'/'+D.viewId):'';
return [{json:{ Name:name, Campaign:hubId?[hubId]:[], ViewLink:D.shareViewLink||'', InternalLink:internal, Deployed:Number(D.landed||0) }}];
