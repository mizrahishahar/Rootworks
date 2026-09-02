// Build Run Log: one row per run, to the logging standard. Status is computed from failed[]
// (every client error line), never a literal; skips are their own section; Client is attached only
// when the run served exactly one client (a record-id filter), never an empty link array. Records In
// = leads in scope across clients, Records Out = DNC rows created. Upserted on Execution ID so a
// launched run closes the row it was launched from and a scheduled run creates its own.
const sd=$getWorkflowStaticData('global');
const run=sd.run||{};
const durS=Math.round((Date.now()-Number(run.startMs||Date.now()))/1000);
const clients=Object.keys(sd.clients||{}).map(id=>sd.clients[id]);
const failed=[];
const skipLines=[], warnLines=[], clientLines=[];
let totalIn=0, totalOut=0, failedClients=0;
const n=x=>Number(x||0);
for(const c of clients){
  totalIn+=n(c.leadsRead);
  totalOut+=n(c.dncCreated);
  if((c.errors||[]).length) failedClients++;
  for(const e of (c.errors||[])) failed.push('**'+c.name+':** '+e);
  for(const s of (c.skips||[])) skipLines.push('**'+c.name+':** '+s);
  for(const w of (c.warnings||[])) warnLines.push('**'+c.name+':** '+w);
  clientLines.push('- **'+c.name+':** '+[
    n(c.leadsRead)+' leads read ('+n(c.notInterested)+' not interested, '+n(c.unsubscribed)+' unsubscribed)',
    n(c.domainCount)+' domains',
    n(c.blocked)+' blocked, '+n(c.alreadyBlocked)+' already in blocklist',
    n(c.dncCreated)+' DNC rows created, '+n(c.dncExisting)+' already there',
    n(c.freeMail)+' free-mail skipped'
  ].join(' · '));
}
const oneClient=/^rec[a-z0-9]{14}$/i.test(String(run.clientFilter||''));
const scope=oneClient?('one client ('+run.clientFilter+', launched from the Hub)'):(run.trigger==='form'?'all clients (launched from the Hub)':'all clients (nightly)');
const md=[];
md.push('**'+clients.length+' clients, '+failedClients+' failed · '+totalIn+' leads in scope · '+totalOut+' DNC rows created**');
md.push('');
md.push('**Scope:** '+scope);
md.push('**Watermark:** '+(run.watermarkMode||'')+' (leads modified at or after '+(run.watermark||'?')+')');
md.push('');
md.push('**Clients**');
for(const l of clientLines) md.push(l);
if(!clientLines.length) md.push('- none picked');
if(failed.length){ md.push(''); md.push('**FAILED ('+failed.length+')**'); for(const e of failed) md.push('- '+e); }
if(skipLines.length){ md.push(''); md.push('**Skipped ('+skipLines.length+')**'); for(const e of skipLines) md.push('- '+e); }
if(warnLines.length){ md.push(''); md.push('**Warnings ('+warnLines.length+')**'); for(const e of warnLines) md.push('- '+e); }
if(!clients.length && run.clientFilter) { md.push(''); md.push('**Skipped (1, the client filter matched no client with a PlusVibe workspace and a Clayroots base)**'); }
sd.clients={};
sd.currentClient='';
sd.pull=null;
sd.block=null;
const row={
  'Automation':'Sync Not Interested to DNC',
  'Status': failed.length ? 'Succeeded with errors' : 'Succeeded',
  'Trigger': run.trigger||'schedule',
  'Run at': run.start||new Date().toISOString(),
  'Duration s': durS,
  'Records In': totalIn,
  'Records Out': totalOut,
  'Errors': failed.length,
  'Target': 'client DNC tables + PlusVibe workspace blocklists',
  'Execution ID': String($execution.id),
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Description': md.join('\n').slice(0,95000)
};
if(oneClient) row['Client']=[run.clientFilter];
return [{ json:row }];
