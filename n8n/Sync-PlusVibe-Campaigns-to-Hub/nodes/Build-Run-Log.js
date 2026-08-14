let results=[]; let t={checked:0,updated:0,problems:[]}; let rs=0;
try{ const sd=$getWorkflowStaticData('global'); results=sd.pvSyncResults||[]; t=sd.threadStats||t; rs=sd.runStartedAt||0; }catch(e){}
const failed=results.filter(r=>!r.ok);
const totalIn=results.reduce((s,r)=>s+(r.campaigns||0),0);
const totalOut=results.reduce((s,r)=>s+(r.written||0),0);
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const lines=results.map(r=> '- **'+r.client+':** '+nf(r.campaigns)+' campaigns · '+nf(r.sent)+' sent · '+nf(r.replies)+' replies'+(r.ok?'':' (FAILED)'));
const allProbs=t.problems||[];
const skipped=allProbs.filter(p=>String(p).includes('no email'));
const probs=allProbs.filter(p=>!String(p).includes('no email'));
const skippedNames=skipped.map(p=>String(p).split(':')[0]);
const errCount=failed.length+probs.length;
const parts=['**'+results.length+' client(s), '+failed.length+' failed**'];
if(lines.length) parts.push('**Clients**\n'+lines.join('\n'));
parts.push('**Threads:** '+nf(t.checked)+' prospects checked · '+nf(t.updated)+' threads refreshed');
if(failed.length) parts.push('**FAILED ('+failed.length+')**\n'+failed.map(r=>'- '+r.client+': campaigns seen but none written').join('\n'));
if(skipped.length) parts.push('**Skipped ('+skipped.length+', no contact email)**\n'+skippedNames.join(', '));
if(probs.length) parts.push('**Thread problems ('+probs.length+')**\n'+probs.map(p=>'- '+p).join('\n'));
const desc=parts.join('\n\n');
return [{ json: {
 'Automation':'Sync PlusVibe Campaigns to Hub',
 'Status': errCount>0 ? 'Succeeded with errors' : 'Succeeded',
 'Run at': $now.toISO(),
 'Records In': totalIn,
 'Records Out': totalOut,
 'Errors': errCount,
 'Target': 'Campaigns + Prospects',
 'Trigger':'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
}}];