const sd=$getWorkflowStaticData('global');
const run=sd.run||{};
const durS=Math.round((Date.now()-new Date(run.start||Date.now()).getTime())/1000);
const clients=Object.keys(sd.clients||{}).map(id=>sd.clients[id]);
let totalIn=0, totalOut=0, failedClients=0;
const allFailed=[], skipLines=[], warnLines=[], clientLines=[], wmHold=[];
for(const c of clients){
  const s=c.summary||{};
  totalIn+=s.leadsPulled||0;
  totalOut+=s.rowsWritten||0;
  const fl=s.failedList||[];
  if(fl.length) failedClients++;
  for(const e of fl) allFailed.push('**'+(s.name||'?')+':** '+e);
  for(const sk of (s.skips||[])) skipLines.push('**'+(s.name||'?')+':** '+sk);
  for(const w of (s.warnings||[])) warnLines.push('**'+(s.name||'?')+':** '+w);
  if(s.pullOk===false) wmHold.push((s.name||'?')+' pull incomplete');
  if(s.writeOk===false) wmHold.push((s.name||'?')+' write failures');
  clientLines.push('- **'+(s.name||'?')+':** '+[(s.campaigns||0)+' campaigns ('+(s.complete||0)+'/'+(s.campaigns||0)+' invariants OK)', (s.leadsPulled||0)+' leads pulled', (s.nominated||0)+' refreshed', (s.rowsWritten||0)+' rows written', s.mode||''].filter(Boolean).join(' · '));
}
const partial=!!(run.clientFilter);
if(partial) wmHold.push('partial run (clientFilter "'+run.clientFilter+'")');
const wmOk=wmHold.length===0 && clients.length>0;
const md=[];
md.push('**'+clients.length+' clients, '+failedClients+' failed**');
md.push('');
md.push('**Watermark:** '+(wmOk?'advanced (pull complete, writes clean)':('HELD - '+wmHold.join('; '))));
md.push('');
md.push('**Clients**');
for(const l of clientLines) md.push(l);
if(allFailed.length){ md.push(''); md.push('**FAILED ('+allFailed.length+')**'); for(const e of allFailed) md.push('- '+e); }
if(skipLines.length){ md.push(''); md.push('**Skipped ('+skipLines.length+')**'); for(const e of skipLines) md.push('- '+e); }
if(warnLines.length){ md.push(''); md.push('**Warnings ('+warnLines.length+')**'); for(const e of warnLines) md.push('- '+e); }
const errTotal=allFailed.length;
sd.clients={};
return [{json:{
  'Automation':'Sync PlusVibe Leads to Clayroots',
  'Status':errTotal?'Succeeded with errors':'Succeeded',
  'Watermark OK':wmOk,
  'Trigger':run.trigger||'event',
  'Run at':run.start||new Date().toISOString(),
  'Duration s':durS,
  'Records In':totalIn,
  'Records Out':totalOut,
  'Errors':errTotal,
  'Execution ID':String($execution.id),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Description':md.join('\n').slice(0,95000)
}}];