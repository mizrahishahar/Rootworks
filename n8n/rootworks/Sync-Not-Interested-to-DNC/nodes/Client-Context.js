// Client Context: opens one client's slot in static data. Every counter the run-log line needs
// starts here; the leg nodes add to it; Close Client seals it.
const sd=$getWorkflowStaticData('global');
const c=$input.first().json;
sd.currentClient=c.clientRecId;
sd.pull=null;
sd.block=null;
sd.clients[c.clientRecId]={ name:c.clientName, ws:c.ws, crBase:c.crBase, dncTableId:'', dncTableName:'', leadsPulled:0, leadsRead:0, notInterested:0, unsubscribed:0, beforeWatermark:0, freeMail:0, noDomain:0, domains:{}, domainCount:0, blocked:0, alreadyBlocked:0, dncCreated:0, dncExisting:0, errors:[], warnings:[], skips:[] };
return [{ json:c }];
