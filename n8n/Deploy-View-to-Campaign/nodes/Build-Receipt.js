const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
let hubId='';
try{ const r=($('Find Hub Campaign').first()||{}).json||{}; if(r.id) hubId=r.id; }catch(e){}
D.receiptName=(D.tableName||D.tableId||'table')+' - '+(D.view||'view');
if(!hubId) D.warnings.push('no Hub Campaigns row for '+D.target+'; receipt created without campaign link');
// The receipt link is the per-view share link of the standing
// "Relevant & Found : Campaigns" view (password {Client}01), parsed from the
// table description at gate time. Client-safe: shows only that view, never
// the base. Never the selector view that deployed; its filter dissolves.
let viewLink=D.shareViewLink||'';
if(!viewLink){ D.warnings.push('share link unresolved; receipt written without a View Link'); }
D.viewLink=viewLink;
return [{json:{Name:D.receiptName, Campaign:hubId?[hubId]:[], ViewLink:viewLink}}];