// Verify Landing: the campaign's live prospect list after the pushes. Alta's pull-in answers
// 200 and can still drop the prospect (paused campaign, proven 2026-08-27), so landing is
// decided HERE by values: prospects created since this run started are the candidates, and
// their persons (fetched next) carry the URLs that match them back to the rows we pushed.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{_none:true, personIds:[]}}]; }
let rows=[];
try{ const j=($input.first()||{}).json||{}; rows=Array.isArray(j.rows)?j.rows:[]; }catch(e){}
D.campaignProspects=rows.length;
const since=new Date((D.startedAt||Date.now())-10*60*1000).toISOString();
const fresh=rows.filter(p=>String(p.createdAt||'')>=since&&p.personId);
D.freshProspects={};
for(const p of fresh) D.freshProspects[p.personId]={prospectId:p.prospectId, sequenceStatus:p.sequenceStatus||''};
const personIds=fresh.map(p=>p.personId).slice(0,300);
if(fresh.length>300) D.warnings.push('readback capped at 300 fresh prospects of '+fresh.length);
if(!personIds.length){
  if(D.pushed) D.warnings.push('pushed '+D.pushed+' but the campaign shows no fresh prospects; Alta may have dropped them (is the campaign paused?)');
  return [{json:{_none:true, personIds:[]}}];
}
return [{json:{personIds}}];
