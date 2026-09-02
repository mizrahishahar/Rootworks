// Collect Scaffold Results: pairs each meta-API response with the call Plan Scaffold Pass
// queued (same order, one response per call), records what was created and what failed, and
// hands one item back to the schema read for the next pass. A create that failed is marked so
// it is never retried; whatever depended on it becomes a counted skip on the next pass.
const sd=$getWorkflowStaticData('global'); const S=sd.scaffold;
const pend=S.pending||[]; const items=$input.all();
items.forEach((it,i)=>{
  const p=pend[i]; if(!p) return;
  const j=it.json||{}; const b=(j.body!==undefined)?j.body:j;
  let err='';
  if(b&&b.error) err=(typeof b.error==='string')?b.error:(b.error.message||b.error.type||JSON.stringify(b.error));
  else if(j.error&&!b.id) err=String(j.error.message||j.error);
  if(!err&&b&&b.id){
    S.seen[p.key]='created';
    S.created.push({ table:p.table, name:p.name, kind:p.kind, id:b.id, how:(p.kind==='table')?'table':'field' });
    if(p.kind==='table'){ for(const n of p.fieldNames||[]){ S.seen[p.table+'.'+n]='created'; S.created.push({ table:p.table, name:n, kind:'plain', id:'', how:'withTable' }); } }
  } else {
    S.seen[p.key]='failed';
    S.failed.push(p.key+': '+(err||'no id in the response').slice(0,200));
  }
});
if(items.length!==pend.length) S.failed.push('pass '+S.pass+': '+pend.length+' calls queued, '+items.length+' responses came back');
S.pending=[];
return [{ json:{ pass:S.pass, created:S.created.length, failed:S.failed.length }, pairedItem:{ item:0 } }];
