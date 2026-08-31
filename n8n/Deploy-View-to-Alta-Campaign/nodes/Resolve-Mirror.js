// Resolve Mirror: the campaign's mirror row in the client base, resolved BEFORE anything is
// sent, because it is both the stamp target and the stamp-gate (a row already linked to it
// never re-enters this campaign). Missing mirror row = created downstream before stamping.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
let rid='';
try{ const r=($input.first()||{}).json||{}; if(r.id) rid=r.id; }catch(e){}
D.stampMirrorRid=rid||'';
return [{json:{needMirror: !D.abort && !!D.mirrorTableId && !rid, mirrorTableId:D.mirrorTableId||'', crBase:D.crBase||'', campName:D.campName||'', target:D.target||''}}];
