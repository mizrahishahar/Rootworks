const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
let hubId='';
try{ const r=($('Find Hub Campaign').first()||{}).json||{}; if(r.id) hubId=r.id; }catch(e){}
D.receiptName=(D.tableName||D.tableId||'table')+' - '+(D.view||'view');
if(!hubId) D.warnings.push('no Hub Campaigns row for '+D.target+'; receipt created without campaign link');
// List CSV carries the per-view share link of the standing
// "Relevant & Found : Campaigns" view (password {Client}01), parsed from the
// table description at gate time. Client-safe: shows only that view, never
// the base. View Link keeps the internal deep link to the exact selector
// view that deployed, our debugging trail. Deployed = confirmed lead count.
let viewLink=D.shareViewLink||'';
if(!viewLink){ D.warnings.push('share link unresolved; receipt written without a client link'); }
D.viewLink=viewLink;
let internalLink='';
if(D.share&&D.tableId&&D.viewId){ internalLink=D.share+'/'+D.tableId+'/'+D.viewId; }
const out={Name:D.receiptName, Campaign:hubId?[hubId]:[], ViewLink:viewLink, InternalLink:internalLink, Deployed:Number(D.deployed||0)};
return [{json:out}];