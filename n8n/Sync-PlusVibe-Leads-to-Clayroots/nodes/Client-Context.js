const sd=$getWorkflowStaticData('global');
const c=$input.first().json;
sd.currentClient=c.clientRecId;
sd.pull={queue:[], idx:0, page:1, attempts:0, got:0, retried:false, byCampaign:{}, campStart:0};
sd.write={queue:[], idx:0, current:null};
sd.clients[c.clientRecId]={name:c.clientName, ws:c.ws, crBase:c.crBase, startedAt:Date.now(), watermark:null, leadsPulled:0, nominated:0, perCampaign:{}, payloads:{}, targetTables:[], skippedTables:[], mirrorId:'', mirrorMap:{}, _noMirrorWarned:{}, updates:{}, errors:[], warnings:[], invariant:[], invariantOk:true, pullOk:true, writeOk:true, goneTables:{}};
return [{json:c}];