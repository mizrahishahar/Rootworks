const sd=$getWorkflowStaticData('global');
if(!Array.isArray(sd.pvSyncResults)) sd.pvSyncResults=[];
let clientRecId='', clientName='';
try{ const p=$('Parse Client').first().json; clientRecId=p.clientRecId||''; clientName=p.clientName||''; }catch(e){}
let rows=[]; try{ rows=$('Format Campaign Rows').all().map(i=>i.json).filter(r=>r&&r['Campaign ID']); }catch(e){}
let upserted=[]; try{ upserted=$('Upsert Campaigns').all().map(i=>i.json); }catch(e){}
const seen=rows.length;
const written=upserted.length;
const sent=rows.reduce((s,r)=>s+(r['Messages Sent']||0),0);
const replies=rows.reduce((s,r)=>s+(r['Replies']||0),0);
const positives=rows.reduce((s,r)=>s+(r['Positive Replies (PV)']||0),0);
const ok=!(seen>0 && written===0);
sd.pvSyncResults.push({client:clientName||'(unknown)', clientRecId, campaigns:seen, written, sent, replies, positives, ok});
return [{ json: { client:clientName||'', ok } }];