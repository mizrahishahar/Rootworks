const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const j=($input.first()||{}).json||{};
if(j.id){ D.mirrorRid=j.id; D.warnings.push('mirror row created for campaign "'+(D.campName||D.target||'?')+'" (the deployment standard normally creates it at campaign build)'); }
else { D.mirrorRid=''; D.warnings.push('mirror row create failed: '+JSON.stringify(j.error||j).slice(0,150)+'; Campaigns not stamped'); }
return [{json:{ok:true}}];
