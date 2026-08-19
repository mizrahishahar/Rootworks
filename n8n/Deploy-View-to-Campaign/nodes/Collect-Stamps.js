const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
for(const it of $input.all()){ const j=it.json||{}; if(j.error) D.errors.push('stamp write: '+JSON.stringify(j.error).slice(0,200)); }
return [{json:{stamped:true}}];