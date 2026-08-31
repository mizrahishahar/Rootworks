// Collect Push: the pull-in responses, per prospect. Alta answers 200 even for pushes it later
// drops (a paused campaign swallows pull-ins silently, proven live 2026-08-27), so a 200 here
// counts only as "sent"; landing is decided by the readback, never by this response.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id; const D=sd[dk];
let sent=0, failed=0;
const items=$input.all();
const pushed=[];
try{ for(const it of $('Build Prospects').all()){ const j=it.json||{}; if(j.recordId) pushed.push(j.recordId); } }catch(e){}
items.forEach((it,i)=>{
  const j=it.json||{};
  const status=Number(j.statusCode)||((j.error)?0:200);
  const rid=pushed[i];
  if(status>=200&&status<300){ sent++; }
  else{ failed++; if(rid&&D.rows[rid]) D.rows[rid].skip='push failed HTTP '+status; }
});
D.pushed=sent;
if(failed) D.warnings.push(failed+' pull-in push(es) failed with a non-2xx status');
return [{json:{sent, failed, campaignId:D.target}}];
