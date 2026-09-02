// Client is attached only when the Clayroots base the poller wrote to resolves to exactly one
// client, which it always does: one poller fire serves one base. When it does not resolve, the key
// is omitted entirely, never sent as an empty link array, which has wiped correct attachments.
const log=Object.assign({},$('Build Log').first().json);
let rec=[];
try{ const rc=$('Resolve Client').first().json; if(rc&&rc.id) rec=[rc.id]; }catch(e){}
if(rec.length){ log['Client']=rec; } else { delete log['Client']; }
return [{json:log}];
