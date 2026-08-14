const sd=$getWorkflowStaticData('global'); const D=sd.deploy;
let hubId='';
try{ const r=($('Find Hub Campaign').first()||{}).json||{}; if(r.id) hubId=r.id; }catch(e){}
D.receiptName=(D.tableName||D.tableId||'table')+' - '+(D.view||'view');
if(!hubId) D.warnings.push('no Hub Campaigns row for '+D.target+'; receipt created without campaign link');
// <shareable link>/<tableId>/<viewId> opens the exact view that was deployed.
let viewLink='';
if(D.share && D.tableId && D.viewId){ viewLink=D.share+'/'+D.tableId+'/'+D.viewId; }
else if(!D.share){ D.warnings.push('client has no Clayroots shareable link; receipt written without a View Link'); }
else if(!D.viewId){ D.warnings.push('view id unresolved; receipt written without a View Link'); }
D.viewLink=viewLink;
return [{json:{Name:D.receiptName, Campaign:hubId?[hubId]:[], ViewLink:viewLink}}];