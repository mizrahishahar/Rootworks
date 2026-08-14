let s={totalInWorkspace:0,truncated:false,campaigns:[]};
let t={checked:0,updated:0,skipped:[]};
let rs=0;
try{ const sd=$getWorkflowStaticData('global'); s=sd.altaSync||s; t=sd.altaThreads||t; rs=sd.runStartedAt||0; }catch(e){}
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const lines=s.campaigns.map(c=>'- **'+c.name+':** '+nf(c.leads)+' leads');
const warn=s.truncated?['**WARNING:** workspace has >100 campaigns, list truncated']:[];
const authFailed=t.skipped.some(p=>String(p).includes('AUTH FAILED'));
const zeroUpsert=s.totalInWorkspace>0 && s.campaigns.length===0;
const errCount=t.skipped.length + (authFailed && !t.skipped.length ? 1 : 0) + (zeroUpsert ? 1 : 0);
const zeroWarn=zeroUpsert?['**ERROR:** 0 campaigns upserted while workspace has '+s.totalInWorkspace+' campaign(s)']:[];
const parts=['**'+s.campaigns.length+' active of '+s.totalInWorkspace+' campaigns in workspace**'];
if(warn.length) parts.push(warn.join('\n'));
if(zeroWarn.length) parts.push(zeroWarn.join('\n'));
if(lines.length) parts.push('**Campaigns**\n'+lines.join('\n'));
parts.push('**Threads:** '+nf(t.checked)+' prospects checked · '+nf(t.updated)+' threads refreshed');
if(t.skipped.length) parts.push('**Thread problems ('+t.skipped.length+')**\n'+t.skipped.map(p=>'- '+p).join('\n'));
const desc=parts.join('\n\n');
return [{ json: {
 'Automation':'Sync Alta Campaigns to Hub',
 'Client': ['reclCOYRBgMowJd8G'],
 'Status': errCount>0 ? 'Succeeded with errors' : 'Succeeded',
 'Run at': $now.toISO(),
 'Records In': s.campaigns.length,
 'Records Out': s.campaigns.length,
 'Errors': errCount,
 'Target': 'Campaigns + Prospects',
 'Trigger':'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
}}];