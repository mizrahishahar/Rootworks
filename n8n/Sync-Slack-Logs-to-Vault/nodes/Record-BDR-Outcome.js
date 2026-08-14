const sd=$getWorkflowStaticData('global');
if(!Array.isArray(sd.bdrResults)) sd.bdrResults=[];
let cfg={}; try{ cfg=$('Client Config').first().json||{}; }catch(e){}
let msgs=0, threads=0;
try{ const it=$('BDR Attach').all().map(i=>i.json).filter(x=>x&&x.msg); msgs=it.length; threads=it.filter(x=>((x.msg.replies)||[]).length>0).length; }catch(e){}
let filename='', slackOk=true, slackErr='';
try{ const f=$('Format BDR File').first().json||{}; filename=f.filename||''; slackOk=f.slackOk!==false; slackErr=f.slackErr||''; }catch(e){}
let fileId=''; try{ fileId=($('Create BDR Log File').first().json||{}).id||''; }catch(e){}
let matched=false; try{ matched=$('Attach Card').all().some(i=>i.json&&i.json.record_id); }catch(e){}
let comments=0; try{ comments=$('Diff New Replies').all().filter(i=>i.json&&i.json.record_id).length; }catch(e){}
sd.bdrResults.push({recordId:cfg.recordId||'', client:cfg.clientName||'', channel:cfg.bdrChannelId||'', msgs:msgs, threads:threads, filename:filename, fileId:fileId, matched:matched, comments:comments, slackOk:slackOk, slackErr:String(slackErr).slice(0,140), runAt:$now.toISO()});
return [{json:{bdr:true, client:cfg.clientName||''}}];