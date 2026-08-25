const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
let hubId='';
try{ const r=($('Find Hub Campaign').first()||{}).json||{}; if(r.id) hubId=r.id; }catch(e){}
D.receiptName=(D.tableName||D.tableId||'table')+' - '+(D.view||'view');
if(!hubId) D.warnings.push('no Hub Campaigns row for '+D.target+'; receipt created without campaign link');
// <shareable link>/<tableId>/<receiptViewId> opens the standing
// "Relevant & Found : Campaigns" view: the durable lead-list window,
// never the selector view that was deployed (its filter dissolves).
let viewLink='';
if(D.share && D.tableId && D.receiptViewId){ viewLink=D.share+'/'+D.tableId+'/'+D.receiptViewId; }
else if(!D.share){ D.warnings.push('client has no Clayroots shareable link; receipt written without a View Link'); }
else if(!D.receiptViewId){ D.warnings.push('Relevant & Found : Campaigns view id unresolved; receipt written without a View Link'); }
D.viewLink=viewLink;
return [{json:{Name:D.receiptName, Campaign:hubId?[hubId]:[], ViewLink:viewLink}}];