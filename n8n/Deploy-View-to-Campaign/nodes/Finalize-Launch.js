const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id;
const D=sd[dk]||{errors:['deploy state missing'],warnings:[],counters:[],rows:{},skipCounts:{},launchId:''};
try{ const r=($('Create Lead List').first()||{}).json||{}; if(!r.id&&!D.abort) D.warnings.push('Lead Lists receipt creation failed'); }catch(e){ if(!D.abort) D.warnings.push('Lead Lists receipt not created'); }
const failed=D.errors||[];
const sc=D.skipCounts||{};
const skipTotal=Object.keys(sc).reduce((s,k)=>s+sc[k],0);
const fmt=v=>Number(v||0).toLocaleString('en-US');
const md=[];
md.push('**Deployed '+fmt(D.deployed||0)+' of '+fmt(D.rowsTotal||0)+' view rows to '+(D.campName||'?')+'**');
md.push('');
md.push('**Campaign:** '+(D.campName||'?')+' ('+(D.target||'?')+')');
md.push('**Table:** '+(D.tableName||D.table||'?')+' ('+(D.tableId||'?')+')');
md.push('**View:** '+(D.view||'?'));
if(D.viewLink) md.push('**Link:** '+D.viewLink);
md.push('**Dedupe mode:** '+(D.dedupe||'Strict'));
if(D.campsStamped) md.push('**Campaigns links stamped:** '+fmt(D.campsStamped)+' (this list = filter Campaigns has the campaign)');
const P=D.pv;
if(P){
  md.push('');
  md.push('**Sent to PlusVibe**');
  md.push('- Sent: '+fmt(P.sent));
  md.push('- Accepted: '+fmt(P.uploaded));
  const diff=(P.sent||0)-(P.uploaded||0);
  md.push('- Not accepted: '+fmt(diff));
  if(P.skipped) md.push('   - Already in the workspace, blocked by dedupe mode "'+(D.dedupe||'Strict')+'": '+fmt(P.skipped));
  if(P.already) md.push('   - Already in this campaign: '+fmt(P.already));
  if(P.duplicate) md.push('   - Same email twice in the upload: '+fmt(P.duplicate));
  if(P.invalid) md.push('   - PlusVibe judged the email invalid: '+fmt(P.invalid));
  if(P.overflowed) md.push('   - Over your plan limit: '+fmt(P.overflowed));
  if(P.overwritten) md.push('   - Existing lead refreshed instead of added: '+fmt(P.overwritten));
  if(P.remaining!==null&&P.remaining!==undefined) md.push('- Leads left in plan: '+fmt(P.remaining));
}
if(D.missing){ md.push('- Sent but not found in the campaign afterwards: '+fmt(D.missing)); }
const vm=D.varMisses||{};
const vmKeys=Object.keys(vm).sort((a,b)=>vm[b]-vm[a]);
if(vmKeys.length){
  md.push('');
  md.push('**Not sent: a required column was empty**');
  md.push('These rows never left Airtable. Fill the column or hide it from the view.');
  for(const k of vmKeys) md.push('- '+k+' was empty on '+fmt(vm[k])+' row'+(vm[k]===1?'':'s'));
}
if(skipTotal){
  md.push('');
  md.push('**Not sent: other reasons ('+fmt(skipTotal)+')**');
  for(const k of Object.keys(sc)) md.push('- '+k+': '+fmt(sc[k]));
}
if(D.receiptName){ md.push(''); md.push('**Lead list receipt:** '+D.receiptName); }
if((D.warnings||[]).length){ md.push(''); md.push('**Warnings ('+D.warnings.length+')**'); for(const w of D.warnings) md.push('- '+w); }
if(failed.length){ md.push(''); md.push('**FAILED ('+failed.length+')**'); for(const e of failed) md.push('- '+e); }
const desc=md.join('\n');
const durS=Math.round((Date.now()-(D.startedAt||Date.now()))/1000);
sd[dk]=null;
const row={
  'Status':failed.length?'Succeeded with errors':'Succeeded',
  'Trigger':'form',
  'Run at':D.runAt||new Date().toISOString(),
  'Duration s':durS,
  'Records In':D.rowsTotal||0,
  'Records Out':D.deployed||0,
  'Errors':failed.length,
  'Execution ID':String($execution.id),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Description':desc.slice(0,95000)
};
return [{json:row}];