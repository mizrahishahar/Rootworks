// Lane Log: the lane's own Hub row, keyed "<parent execution>-quickenrich", Automation
// "Enrich Contacts QuickEnrich", Client attached. Status computed: a skipped lane (no credential,
// out of credits, nothing to ask) is Succeeded with a Skipped line; vendor errors and refused
// writes count as errors; Failed only when every call failed and nothing was written.
const ctx=$('Enrich Trigger').first().json||{};
const a=$getWorkflowStaticData('global').lane||{};
const n=(v)=>Number(v)||0;
const covered=Object.keys(a.coveredDomains||{}).length;
const failed=n(a.errors)+n(a.writeErrors);
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(a.startedAt).getTime())/1000)); }catch(e){}
const allFailed=n(a.called)>0&&n(a.errors)>=n(a.called)&&!n(a.written);
const lines=[
  '**QuickEnrich: '+n(a.companiesIn)+' companies asked in '+n(a.chunks)+' chunk'+(n(a.chunks)===1?'':'s')+', '+n(a.returned)+' people returned, '+n(a.built)+' new, '+n(a.updated)+' held filled, '+n(a.written)+' rows written**',
  '', '**Parent run:** '+(ctx.parentExecId||'?')+' (this row is the QuickEnrich lane of it)',
  '', '- **Vendor:** called '+n(a.called)+', returned '+n(a.returned)+', kept '+n(a.kept)+(n(a.credits)?', credits '+(Math.round(n(a.credits)*100)/100):'')+(n(a.errors)?', errors '+n(a.errors)+(a.firstError?' ('+a.firstError+')':''):''),
  '- **Merge:** '+n(a.built)+' new rows; '+n(a.updated)+' held rows filled ('+n(a.emailsAppended)+' emails appended); '+n(a.heldUnchanged)+' held unchanged; '+n(a.dupes)+' same-person merges; '+n(a.noKey)+' without a usable first name; '+n(a.fenced)+' LinkedIn URLs rejected by the name fence; '+n(a.dnc)+' on the DNC list',
  '- **Written (confirmed by Airtable):** '+n(a.written)+' ('+n(a.updatedWritten)+' updates of held rows)'+(n(a.writeErrors)?', '+n(a.writeErrors)+' refused':''),
  '- **Companies with at least one person after this lane:** '+covered
];
if(a.singleSelectSource) lines.push('- **Contact Source is a single select on this base:** only the first source per person was recorded');
if(a.skipped) lines.push('', '**Skipped ('+a.skipped+')**');
if((a.writeReasons||[]).length){ lines.push('', '**Write failures**'); for(const r of a.writeReasons) lines.push('- '+r); }
const log={ 'Execution ID':(ctx.parentExecId||String($execution.id))+'-quickenrich', 'Automation':'Enrich Contacts QuickEnrich', 'Status':allFailed?'Failed':(failed?'Succeeded with errors':'Succeeded'), 'Trigger':'event', 'Errors':failed, 'Run at':a.startedAt, 'Target':'People ('+(ctx.peopleTableId||'')+')', 'Records In':n(a.companiesIn), 'Records Out':n(a.written), 'Duration s':dur, 'Description':lines.join('\n'), 'Tally':JSON.stringify(Object.assign({}, a, { coveredDomains:covered })), 'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id };
if(ctx.clientRecId) log['Client']=[ctx.clientRecId];
return [{ json:log }];
