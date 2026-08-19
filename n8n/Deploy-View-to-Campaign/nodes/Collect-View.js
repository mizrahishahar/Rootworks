const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const rows=[];
for(const it of $input.all()){
  const j=it.json||{};
  if(Array.isArray(j.records)) rows.push(...j.records);
  else if(j.error) D.errors.push('view read: '+JSON.stringify(j.error).slice(0,200));
}
D.viewRows=rows;
return [{json:{hasDnc:!!D.dncTableId}}];