const sd=$getWorkflowStaticData('global');
sd.runStartedAt=$now.toMillis();
sd.pvSyncResults=[];
sd.clientMap={};
// The Email Bison lane is hardcoded to DuoDiv (Operator ruling 2026-09-06): Get Bison Clients
// returns that one registry row. A launched run with a Client on its launch row that is not DuoDiv
// matches nobody and is a named skip, not an error.
const cf=String((sd.launch||{}).clientFilter||'');
const all=$input.all().filter(it=>it.json&&it.json.id);
const picked=cf?all.filter(it=>it.json.id===cf):all;
sd.syncScope=cf?(picked.length?'one client (on demand)':'client filter matched no Email Bison client'):'all Email Bison clients';
for(const it of picked){ const r=it.json||{}; const f=r.fields||r; sd.clientMap[r.id]={name:f['Client']||''}; }
// Nothing to loop over: emit one placeholder so the Any Clients? gate can route straight to the run log.
if(!picked.length) return [{ json: { _empty:true } }];
return picked;
