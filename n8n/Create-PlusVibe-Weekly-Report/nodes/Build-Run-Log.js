let results=[];
let rs=0;
try{ const sd=$getWorkflowStaticData('global'); results=sd.weeklyReportResults||[]; rs=sd.runStartedAt||0; }catch(e){}
const failed=results.filter(r=>!r.ok);
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const lines=results.map(r=> '- **'+r.client+' ['+r.reportDay+']:** '+nf(r.launchedWeek)+' launched · '+nf(r.sentWeek)+' sent · '+nf(r.contactedWeek)+' contacted · '+nf(r.repliesWeek)+' replies · '+nf(r.newLeads)+' new leads · '+nf(r.bookedWeek||0)+' calls booked'+(r.excluded?' ('+r.excluded+' non-PV prospects excluded)':'')+(r.ok?'':' (PV FAILED)')+(r.errPages?' ('+r.errPages+' unibox pages failed, replies may undercount)':'')+(r.truncated?' (replies window truncated)':'')+(r.noChannel?' (no Slack channel)':''));
const errs=results.filter(r=>r.pvErr);
const parts=['**'+results.length+' client(s), '+failed.length+' failed**'];
if(lines.length) parts.push('**Clients**\n'+lines.join('\n'));
if(failed.length) parts.push('**FAILED ('+failed.length+')**\n'+failed.map(r=>'- '+r.client+': '+(r.pvErr||'PV failed')).join('\n'));
if(errs.length) parts.push('**PV errors ('+errs.length+')**\n'+errs.map(r=>'- '+r.client+': '+r.pvErr).join('\n'));
const desc=parts.join('\n\n');
return [{ json: {
 'Automation':'Create PlusVibe Weekly Report',
 'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
 'Run at': $now.toISO(),
 'Records In': results.length,
 'Records Out': results.length,
 'Errors': failed.length,
 'Target': 'Reports + client Slack channels',
 'Trigger':'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
}}];