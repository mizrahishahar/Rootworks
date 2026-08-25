const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
D.mirrorRid='';
// No mirror table (warned in Plan Variables), aborted run, or a failed read-back:
// no links get stamped, so no row is needed.
if(D.abort||D.rbFailed||!D.mirrorTableId){ return [{json:{needCreate:false}}]; }
let rid='', err='';
for(const it of $input.all()){
  const j=it.json||{};
  if(j.error){ if(!err) err=JSON.stringify(j.error).slice(0,150); }
  else if(j.id&&!rid) rid=j.id;
}
// A failed lookup must not create: a duplicate mirror row would split the links.
if(err){ D.warnings.push('mirror row lookup failed: '+err+'; Campaigns not stamped'); return [{json:{needCreate:false}}]; }
if(rid){ D.mirrorRid=rid; return [{json:{needCreate:false}}]; }
return [{json:{needCreate:true, campName:D.campName||D.target||'', campaignId:D.target||''}}];
