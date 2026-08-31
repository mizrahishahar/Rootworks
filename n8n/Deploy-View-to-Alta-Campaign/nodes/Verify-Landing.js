// Verify Landing: the campaign's live prospect list after the pushes. Alta's pull-in answers
// 200 and can still drop the prospect (paused campaign, proven 2026-08-27), so landing is
// decided HERE by values. Fresh prospects (created since run start) are the primary
// candidates; if pushed rows remain unaccounted for, the WHOLE membership is resolved
// (capped) so a row that landed in an earlier crashed run is recognized and STAMPED instead
// of being re-pushed every day forever - the crash-hole closed 2026-08-31.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
if(D.abort){ return [{json:{_none:true, personIds:[]}}]; }
let rows=[];
try{ const j=($input.first()||{}).json||{}; rows=Array.isArray(j.rows)?j.rows:[]; }catch(e){}
D.campaignProspects=rows.length;
const since=new Date((D.startedAt||Date.now())-10*60*1000).toISOString();
D.freshProspects={};
const freshIds=[]; const oldIds=[];
for(const p of rows){
  if(!p.personId) continue;
  if(String(p.createdAt||'')>=since){ D.freshProspects[p.personId]={prospectId:p.prospectId}; freshIds.push(p.personId); }
  else oldIds.push(p.personId);
}
let personIds=freshIds.slice(0,300);
// Pushed more than fresh accounts for? A prior run may have landed rows it never stamped.
if(D.pushed>freshIds.length&&oldIds.length){
  D.fallbackUsed=true;
  personIds=personIds.concat(oldIds.slice(0,Math.max(0,500-personIds.length)));
  D.warnings.push('pushed '+D.pushed+' but only '+freshIds.length+' fresh prospects; resolving '+Math.min(oldIds.length,500-freshIds.length)+' older members to heal unstamped landings');
}
if(freshIds.length>300) D.warnings.push('readback capped at 300 fresh prospects of '+freshIds.length);
if(!personIds.length){
  if(D.pushed) D.warnings.push('pushed '+D.pushed+' but the campaign shows no prospects at all; Alta may have dropped them (is the campaign paused?)');
  return [{json:{_none:true, personIds:[]}}];
}
return [{json:{personIds}}];
