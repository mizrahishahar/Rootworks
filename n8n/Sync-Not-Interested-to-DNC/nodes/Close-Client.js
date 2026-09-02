// Close Client: seals the client's slot (the domain map is dropped, the counters stay for the run
// log) and frees the per-client static data before the loop takes the next client.
const sd=$getWorkflowStaticData('global');
const id=sd.currentClient;
const c=sd.clients[id];
if(c){ delete c.domains; }
sd.pull=null;
sd.block=null;
return [{ json:{ clientRecId:id } }];
