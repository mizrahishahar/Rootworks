const lg=$('Launch Gate').first().json;
const start=lg.startedAt;
let rows=[]; try{ rows=$('To Airtable').all().map(i=>i.json); }catch(e){}
let recIn=0; try{ recIn=$('Read Records').all().map(i=>i.json).filter(j=>j&&j.id).length; }catch(e){}
const c=(f)=>rows.filter(f).length;
const mv=(v)=>c(r=>r.MV===v);
const ok=mv('ok'), catchAll=mv('catch_all'), invalid=mv('invalid'), unknown=mv('unknown'), errd=mv('error'), skipped=mv('skipped');
const verifying=c(r=>r.Status==='verifying');
const recordsOut=rows.length;
const ms=Date.parse(start);
const dur=ms?Math.round((Date.now()-ms)/1000):null;
const desc=[
'Verify Emails (staging) run - record-launched. MillionVerifier pass (catch-alls to BounceBan Poller).',
'- Target: '+lg.baseId+' / '+lg.tableId,
'- Records read: '+recIn,
'- Verified: ok '+ok+' / catch_all '+catchAll+' / invalid '+invalid+' / unknown '+unknown,
'- Errored: '+errd+'  |  Skipped (no email): '+skipped,
'- Sent to BounceBan (Status=verifying): '+verifying,
'- Rows updated: '+recordsOut,
'- Duration: '+(dur!=null?dur+'s':'n/a')
].join('\n');
return [{ json:{ id: lg.recordId, 'Status':'Succeeded', 'Records In': recIn, 'Records Out': recordsOut, 'Errors': errd, 'Duration s': dur, 'Description': desc, 'Execution ID': String($execution.id), 'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id } }];