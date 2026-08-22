const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.intentResults=[];
// Scheduled runs enroll for every client with Intent Tables. A launched run with a Client on its launch row serves that client only.
const cf=String((sd.launch||{}).clientFilter||'');
const all=$input.all().filter(it=>it.json&&it.json.id);
const picked=cf?all.filter(it=>it.json.id===cf):all;
sd.syncScope=cf?(picked.length?'one client (on demand)':'client filter matched no Intent client'):'all clients';
// Nothing to loop over: emit one placeholder so the Any Clients? gate can route straight to the launch-row close.
if(!picked.length) return [{ json: { _empty:true } }];
return picked;
