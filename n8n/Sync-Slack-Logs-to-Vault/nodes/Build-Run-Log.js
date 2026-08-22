let results=[]; let bdr=[]; let rs=0; let launch={}; let scope='all clients';
try{ const sd=$getWorkflowStaticData('global'); results=sd.slackSyncResults||[]; bdr=sd.bdrResults||[]; rs=sd.runStartedAt||0; launch=sd.launch||{}; scope=sd.syncScope||scope; }catch(e){}
const failed=results.filter(r=>!r.ok);
const okOnes=results.filter(r=>r.ok);
const totalMsgs=results.reduce((s,r)=>s+(r.msgs||0),0);
const files=results.filter(r=>r.file).length;
const nf=(x)=>Number(x||0).toLocaleString('en-US');
const lines=okOnes.map(r=> '- **'+r.client+' ('+(r.channel||'?')+'):** '+nf(r.msgs)+' msgs · '+(r.file?'file written':'no file'));
// The BDR leg is part of this run, not a run of its own: its outcome rolls up here.
const bdrFailed=bdr.filter(b=>!b.slackOk||!b.fileId);
const bdrLines=bdr.map(b=>'- **'+b.client+' ('+(b.channel||'?')+'):** '+nf(b.msgs)+' msgs, '+nf(b.threads)+' with threads · '+(b.fileId?'file written':'NOT written')+' · '+(b.matched?(nf(b.comments)+' new thread repl(ies) pushed as prospect comments'):'no prospect matched')+(b.slackOk?'':' (Slack fetch failed: '+(b.slackErr||'unknown')+')'));
const totalBdrMsgs=bdr.reduce((s,b)=>s+(b.msgs||0),0);
const totalComments=bdr.reduce((s,b)=>s+(b.comments||0),0);
const parts=['**'+results.length+' client(s), '+failed.length+' failed'+(bdr.length?' · '+bdr.length+' BDR channel(s), '+bdrFailed.length+' failed':'')+'**','**Scope:** '+scope];
if(lines.length) parts.push('**Clients**\n'+lines.join('\n'));
if(bdrLines.length) parts.push('**BDR channels**\n'+bdrLines.join('\n'));
if(failed.length) parts.push('**FAILED ('+failed.length+')**\n'+failed.map(r=>'- '+r.client+' ('+(r.channel||'?')+'): '+(r.error||'unknown')).join('\n'));
if(bdrFailed.length) parts.push('**BDR FAILED ('+bdrFailed.length+')**\n'+bdrFailed.map(b=>'- '+b.client+': '+(!b.slackOk?('Slack fetch failed: '+(b.slackErr||'unknown')):'log file not written to Drive')).join('\n'));
if(launch.clientFilter && !results.length) parts.push('**Skipped (1, client filter matched no Slack-Sync client)**');
const desc=parts.join('\n\n');
const row={
 'Automation':'Sync Slack Logs to Vault',
 'Status': (failed.length+bdrFailed.length)>0 ? 'Succeeded with errors' : 'Succeeded',
 'Run at': $now.toISO(),
 'Records In': totalMsgs+totalBdrMsgs,
 'Records Out': files+bdr.filter(b=>b.fileId).length+totalComments,
 'Errors': failed.length+bdrFailed.length,
 'Target': results.length+' client channel(s)'+(bdr.length?' + '+bdr.length+' BDR channel(s)':'')+' -> Drive Logs folders',
 'Trigger': launch.trigger||'schedule',
 'Execution ID': String($execution.id),
 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
 'Duration s': Math.round(($now.toMillis() - (rs||$now.toMillis()))/1000),
 'Description': desc
};
// Client is attached only when the run served exactly one client; never an empty link array.
if(launch.clientFilter) row['Client']=[launch.clientFilter];
return [{json: row}];
