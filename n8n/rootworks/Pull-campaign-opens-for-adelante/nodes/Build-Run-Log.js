const sd=$getWorkflowStaticData('global');
const rs=sd.runStartedAt||0;
const ctx=sd.ctx||{};
const sum=sd.campSummary||[];
const rows=sd.openRows||[];
let written=0;
try{ written=$('Upsert Openers').all().filter(i=>i&&i.json&&i.json.id).length; }catch(e){}
const lines=sum.map(s=> '- **'+s.campaign+':** '+s.openers+' openers · '+s.sent+' sent · '+s.notSent+' never sent');
const bad = rows.length>0 && written===0;
const descParts=['**'+(ctx.clientName?ctx.clientName+': ':'')+sum.length+' tracked campaign(s), '+rows.length+' openers, '+written+' rows upserted**'];
if(lines.length) descParts.push('**Campaigns**\n'+lines.join('\n'));
if(bad) descParts.push('**NO ROWS WRITTEN**');
const desc=descParts.join('\n\n');
return [{ json: {
 'Automation':'Pull campaign opens for adelante',
 'Status': bad ? 'Failed' : 'Succeeded',
 'Run at': $now.toISO(),
 'Client': ctx.clientRecId ? [ctx.clientRecId] : [],
 'Records In': sum.reduce((s,r)=>s+(r.leads||0),0),
 'Records Out': written,
 'Errors': bad ? 1 : 0,
 'Target': 'Openers table',
 'Trigger':'webhook',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
}}];