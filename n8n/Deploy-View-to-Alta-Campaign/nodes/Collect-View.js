// Collect View: the paginated view read into the run state, and the one question the DNC branch
// asks. The PlusVibe door's node, same shape: rows land in D.viewRows and Build Prospects reads
// them from there, so the DNC read can sit between the two without breaking the row flow.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
const rows=[];
for(const it of $input.all()){
  const j=it.json||{};
  if(Array.isArray(j.records)) rows.push(...j.records);
  else if(j.id&&j.fields) rows.push(j);
  else if(j.error) D.errors.push('view read: '+JSON.stringify(j.error).slice(0,200));
}
D.viewRows=rows;
return [{json:{hasDnc:!!D.dncTableId}}];
