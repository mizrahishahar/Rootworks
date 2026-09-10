const sd=$getWorkflowStaticData('global');
const launch=sd.launch||{};
const run=sd.creditsRun||{attempted:0,failed:[],skipped:[]};
let rows=[]; try{ rows=$('Upsert Credits').all().map(i=>i.json).filter(r=>r&&(r.id||r.fields)); }catch(e){}
const lines=rows.map(r=>{ const f=r.fields||r; return '- **'+(f.Tool||'?')+':** '+(f.Credits===undefined||f.Credits===null?'n/a':f.Credits)+(f.Unit?' '+f.Unit:'')+(f['Daily Burn']!==undefined&&f['Daily Burn']!==null?' · burn '+f['Daily Burn']+'/day':'')+(f['Days Left']!==undefined&&f['Days Left']!==null?' · ~'+f['Days Left']+' days':'')+(f.Alert?' **ALERT**':''); });
const parts=['**'+run.attempted+' tool(s) read, '+run.failed.length+' failed, '+rows.length+' row(s) written**'];
if(lines.length) parts.push('**Balances**\n'+lines.join('\n'));
if(run.failed.length) parts.push('**FAILED ('+run.failed.length+')**\n'+run.failed.map(x=>'- '+x).join('\n'));
if(run.skipped.length) parts.push('**Skipped ('+run.skipped.length+', no balance API)**\n'+run.skipped.map(x=>'- '+x).join('\n'));
return [{ json:{
  'Automation':'Sync Tool Credits to Hub',
  'Status': run.failed.length?'Succeeded with errors':'Succeeded',
  'Run at': $now.toISO(),
  'Records In': run.attempted,
  'Records Out': rows.length,
  'Errors': run.failed.length,
  'Target': 'Credits',
  'Trigger': launch.trigger||'schedule',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Duration s': Math.round(($now.toMillis()-(launch.startedAt||$now.toMillis()))/1000),
  'Description': parts.join('\n\n')
}}];
