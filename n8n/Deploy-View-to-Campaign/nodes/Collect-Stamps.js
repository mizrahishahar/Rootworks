const sd=$getWorkflowStaticData('global'); const D=sd.deploy;
for(const it of $input.all()){ const j=it.json||{}; if(j.error) D.errors.push('stamp write: '+JSON.stringify(j.error).slice(0,200)); }
return [{json:{stamped:true}}];