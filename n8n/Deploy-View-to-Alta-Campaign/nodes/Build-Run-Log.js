// Build Run Log: the run's one row plus the launch-row closeout, per the logging standard.
// Landing counts come from the readback, never from pull-in responses.
const sd=$getWorkflowStaticData('global'); const dk='deploy_'+$execution.id;
// Static data does not survive the RB Wait resume; on the post-push path Collect Push carries
// the state. Pre-push abort paths never crossed the wait and still find sd intact.
let D=sd[dk];
if(!D){ try{ D=$('Collect Push').first().json._state; }catch(e){} if(D) sd[dk]=D; }
D=D||{errors:['deploy state missing'],warnings:[],rows:{},skipCounts:{},launchId:''};
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const failed=(D.errors||[]).slice();
const sc=D.skipCounts||{};
const md=[];
md.push('**Landed '+nf(D.landed)+' of '+nf(D.rowsTotal)+' view rows in '+(D.campName||D.target||'?')+'**');
md.push('');
md.push('**Campaign:** '+(D.campName||'?')+' ('+(D.target||'?')+') · **View:** '+(D.view||'?')+' on '+(D.tableName||D.table||'?')+' ('+(D.tableId||'?')+')');
md.push('');
md.push('**Funnel**');
md.push('- **View rows:** '+nf(D.rowsTotal));
const skipTotal=Object.keys(sc).reduce((s,k)=>s+sc[k],0);
if(skipTotal){ md.push('- **Skipped before push ('+nf(skipTotal)+'):**'); for(const k of Object.keys(sc)) md.push('   - '+k+': '+nf(sc[k])); }
md.push('- **Pushed:** '+nf(D.pushed));
md.push('- **Landed (readback):** '+nf(D.landed));
if(D.missing) md.push('- **Pushed but not in the campaign:** '+nf(D.missing));
const pz=(D.pausedTitle||0)+(D.pausedUrl||0)+(D.pausedNoData||0);
if(pz){ md.push('- **Auto-paused after landing:** '+nf(pz)+' (title rule '+nf(D.pausedTitle)+' · URL mismatch '+nf(D.pausedUrl)+' · no person data '+nf(D.pausedNoData)+')'); for(const n of (D.pausedNames||[])) md.push('   - '+n); }
md.push('- **Campaigns links stamped:** '+nf(D.campsStamped));
if((D.warnings||[]).length){ md.push(''); md.push('**Warnings ('+D.warnings.length+')**'); for(const w of D.warnings) md.push('- '+w); }
if(failed.length){ md.push(''); md.push('**FAILED ('+failed.length+')**'); for(const e of failed) md.push('- '+e); }
const desc=md.join('\n');
const durS=Math.round((Date.now()-(D.startedAt||Date.now()))/1000);
sd[dk]=null;
const status=D.abort?'Failed':(failed.length||pz||D.missing?'Succeeded with errors':'Succeeded');
return [{json:Object.assign({_launchId:D.launchId||''},{
  'Automation':'Deploy View to Campaign',
  'Status':status,
  'Run at':D.runAt||$now.toISO(),
  'Duration s':durS,
  'Records In':D.rowsTotal||0,
  'Records Out':D.landed||0,
  'Errors':failed.length+ (pz?1:0),
  'Target':(D.tableName||D.table||'')+' ('+(D.tableId||'')+') -> '+(D.campName||D.target||''),
  'Execution ID':String($execution.id),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Description':desc.slice(0,95000)
 })}];
