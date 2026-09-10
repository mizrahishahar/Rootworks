const sd=$getWorkflowStaticData('global');
if(!Array.isArray(sd.syncResults)) sd.syncResults=[];
const cw=$('Loop Over Clients').first().json;
let rows=[]; try{ rows=$('Build Inbox Rows').all().map(i=>i.json).filter(r=>r&&r['Account ID']); }catch(e){}
let written=[]; try{ written=$('Upsert Inboxes').all().map(i=>i.json); }catch(e){}
const seen=rows.length;
const failedCount=rows.filter(r=>r._failed).length;
const ok=!(seen>0 && written.length===0);
sd.syncResults.push({ client:cw.clientName, inboxes:seen, written:written.length, failed:failedCount, ok });
return [{ json: { done:true } }];