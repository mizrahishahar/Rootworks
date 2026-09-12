const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.slackSyncResults=[];
sd.bdrResults=[];
// Scheduled runs sync every enabled client. A launched run with a Client on its launch row syncs that client only.
const cf=String((sd.launch||{}).clientFilter||'');
const all=$input.all().filter(it=>it.json&&it.json.id);
const picked=cf?all.filter(it=>it.json.id===cf):all;
sd.syncScope=cf?(picked.length?'one client (on demand)':'client filter matched no Slack-Sync client'):'all clients';
// Nothing to loop over: emit one placeholder so the Any Clients? gate can route straight to the run log.
if(!picked.length) return [{ json: { _empty:true } }];
return picked;
