// Sync Summary: the last node. This helper runs inside the Campaigns Manager and writes no Hub row
// of its own; this one item is what the manager reads and rolls into its row. problems[] is what
// the manager counts as errors; skips are named separately and never counted.
const sd=$getWorkflowStaticData('global');
const run=sd.run||{};
const clients=Object.keys(sd.clients||{}).map(id=>sd.clients[id]);
const n=x=>Number(x||0);
const problems=[]; const skips=[];
let leads=0, notInterested=0, unsubscribed=0, domains=0, blocked=0, alreadyBlocked=0, created=0, existing=0, freeMail=0;
for(const c of clients){
  leads+=n(c.leadsRead); notInterested+=n(c.notInterested); unsubscribed+=n(c.unsubscribed);
  domains+=n(c.domainCount); blocked+=n(c.blocked); alreadyBlocked+=n(c.alreadyBlocked);
  created+=n(c.dncCreated); existing+=n(c.dncExisting); freeMail+=n(c.freeMail);
  for(const e of (c.errors||[])) problems.push(c.name+': '+e);
  for(const s of (c.skips||[])) skips.push(c.name+': '+s);
  for(const w of (c.warnings||[])) problems.push(c.name+': '+w);
}
if(!clients.length) skips.push(run.clientFilter ? 'the client filter matched no client with a PlusVibe workspace and a Clayroots base' : 'no Hub Clients row carries both a PlusVibe Workspace ID and a Clayroots Base ID');
const nf=x=>Number(x||0).toLocaleString('en-US');
const detail=nf(clients.length)+' client(s), '+nf(leads)+' lead(s) said no ('+nf(notInterested)+' not interested, '+nf(unsubscribed)+' unsubscribed), '+nf(domains)+' domain(s), '+nf(blocked)+' blocked on PlusVibe ('+nf(alreadyBlocked)+' already), '+nf(created)+' DNC row(s) created ('+nf(existing)+' already there), '+nf(freeMail)+' free-mail skipped; watermark '+String(run.watermarkMode||'');
sd.clients={}; sd.currentClient=''; sd.pull=null; sd.block=null;
return [{ json: {
 _sync: 'Sync PlusVibe Not Interested to DNC',
 scope: run.clientFilter ? 'one client' : 'all clients',
 clients: clients.length,
 in: leads,
 out: created,
 detail,
 problems,
 skips,
 seconds: Math.round((Date.now()-Number(run.startMs||Date.now()))/1000),
}}];
