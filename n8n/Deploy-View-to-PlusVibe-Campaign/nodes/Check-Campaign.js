const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(!D.abort){
  const camps=[];
  for(const it of $input.all()){
    const j=it.json||{};
    const arr=Array.isArray(j)?j:(Array.isArray(j.campaigns)?j.campaigns:(Array.isArray(j.data)?j.data:((j.id||j._id)?[j]:[])));
    for(const x of arr){ if(x&&(x.id||x._id)) camps.push(x); }
  }
  const hit=camps.find(x=>String(x.id||x._id)===D.target);
  if(!hit){ D.abort='campaign not found'; D.errors.push('campaign '+D.target+' not found in workspace '+D.ws+' ('+camps.length+' campaigns listed); nothing was sent'); }
  else { D.campName=hit.camp_name||hit.name||D.target; }
}
return [{json:{abort:!!D.abort, crBase:D.crBase||'', target:D.target||'', metaUrl:'https://api.airtable.com/v0/meta/bases/'+(D.crBase||'missing')+'/tables'}}];