let rows=[]; let rs=0; let launch={};
try{ const sd=$getWorkflowStaticData('global'); rows=sd.bdrResults||[]; rs=sd.runStartedAt||0; launch=sd.launch||{}; }catch(e){}
return rows.map(r=>{
  const failed=[];
  if(!r.slackOk) failed.push('Slack fetch failed: '+(r.slackErr||'unknown'));
  else if(!r.fileId) failed.push('log file not written to Drive');
  let desc=[
    '**'+r.msgs+' messages, '+r.threads+' with threads, '+r.comments+' CRM comments**',
    '',
    '- **Fired by:** Sync Slack Logs to Vault',
    '- **Channel synced:** '+(r.channel||'?'),
    '- **Pulled:** '+r.msgs+' message(s), '+r.threads+' with threads',
    '- **File:** '+(r.fileId?((r.filename||'(unnamed)')+' (Drive id '+r.fileId+') in the client Logs folder'):'NOT written ('+(r.filename||'no file')+')'),
    '- **CRM:** '+(r.matched?(r.comments+' new BDR thread repl(ies) pushed as Hub Prospects record comments'):'no prospect matched, no comments pushed')
  ].join('\n');
  if(failed.length) desc+='\n\n**FAILED ('+failed.length+')**\n'+failed.map(x=>'- '+x).join('\n');
  // One row per BDR channel, its own Execution ID suffix so it never collides with the parent run's row.
  const row={
    'Automation':'Sync BDR Channel',
    'Status': failed.length?'Succeeded with errors':'Succeeded',
    'Run at': r.runAt||$now.toISO(),
    'Records In': r.msgs,
    'Records Out': (r.fileId?1:0)+r.comments,
    'Errors': failed.length,
    'Target': (r.channel||'?')+' -> '+(r.filename||'')+' + Prospect comments',
    'Trigger': launch.trigger||'schedule',
    'Execution ID': String($execution.id)+'-bdr-'+(r.recordId||'x'),
    'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
    'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
    'Description': desc
  };
  if(r.recordId) row['Client']=[r.recordId];
  return {json: row};
});
