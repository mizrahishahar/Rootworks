const sd=$getWorkflowStaticData('global');
if(!Array.isArray(sd.slackSyncResults)) sd.slackSyncResults=[];
let cfg={}; try{cfg=$('Client Config').first().json||{};}catch(e){}
let ok=true, err='';
let msgs=0;
try{ msgs=$('Attach replies to parent').all().map(i=>i.json).filter(m=>m&&m.ts).length; }catch(e){}
try{ const h=$('Get channel messages').first().json||{}; if(h.error){ ok=false; err=String((h.error&&h.error.message)||h.error); } }catch(e){ ok=false; err=err||'channel fetch failed'; }
let fileId='';
try{ const f=$('Create file from text').first().json||{}; if(f.id){ fileId=f.id; } else { ok=false; err=err||String((f.error&&(f.error.message||f.error))||'file not written'); } }catch(e){ ok=false; err=err||'file not written'; }
sd.slackSyncResults.push({client:cfg.clientName||'(unknown)', channel:cfg.slackChannelId||'', msgs:msgs, file:fileId, ok:ok, error:String(err).slice(0,140)});
return [{json:{client:cfg.clientName||'', ok:ok}}];