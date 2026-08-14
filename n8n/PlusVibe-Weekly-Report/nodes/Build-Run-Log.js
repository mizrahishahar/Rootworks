let results=[];
try{ const sd=$getWorkflowStaticData('global'); results=sd.weeklyReportResults||[]; }catch(e){}
const failed=results.filter(r=>!r.ok);
const lines=results.map(r=> r.client+': '+r.sentWeek+' sent, '+r.repliesWeek+' replies, '+r.newLeads+' new leads this week'+(r.ok?'':' (PV WEEKLY FAILED)')+(r.noChannel?' (no Slack channel)':''));
const errs=results.filter(r=>r.pvErr).map(r=> r.client+': '+r.pvErr);
const desc=['PlusVibe Weekly Report run: '+results.length+' client(s), '+failed.length+' failed'].concat(lines).concat(errs).join('\n');
return [{ json: {
 'Automation':'PlusVibe Weekly Report',
 'Status': failed.length ? 'Failed' : 'Succeeded',
 'Run at': $now.toISO(),
 'Records In': results.length,
 'Records Out': results.length,
 'Errors': failed.length,
 'Target': 'Reports + client Slack channels',
 'Trigger':'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Description': desc
}}];