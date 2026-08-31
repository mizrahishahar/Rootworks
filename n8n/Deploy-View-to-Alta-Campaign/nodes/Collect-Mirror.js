// Collect Mirror: the just-created mirror row's id becomes the stamp target.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
try{ const r=($input.first()||{}).json||{}; if(r.id) D.stampMirrorRid=r.id; }catch(e){}
if(!D.stampMirrorRid&&D.mirrorTableId) D.warnings.push('mirror row could not be created; Campaigns links not stamped this run');
return [{json:{mirrorRid:D.stampMirrorRid||''}}];
