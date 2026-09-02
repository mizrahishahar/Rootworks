const wfid='jtBHNttawTdjG6Tv';
const p=$('Params In').first().json;
const start=$('Email Guard').first().json.startedAt;
let t={}; try{ t=$('Resolve Table').first().json||{}; }catch(e){}
const target=(t.tableName||p['Table']||'')+' ('+(t.tableId||'')+')';
let rows=[]; try{ rows=$('Verdict').all().map(i=>i.json); }catch(e){}
let recIn=0; try{ recIn=$('Read Records').all().map(i=>i.json).filter(j=>j&&j.id).length; }catch(e){}
const c=(fn)=>rows.filter(fn).length;
const mv=(v)=>c(r=>r._mv===v);
const sd=$getWorkflowStaticData('global');
if(!sd._wfLogTotals || sd._wfLogTotals.execId!==String($execution.id)){ sd._wfLogTotals={ execId:String($execution.id), ok:0, catchAll:0, invalid:0, disposable:0, unknown:0, errd:0, skipped:0, verifying:0, recordsOut:0, preserved:0, blanked:0, reverified:0, p0:0, p1:0, p2:0, p3:0 }; }
const a=sd._wfLogTotals;
a.ok+=mv('ok'); a.catchAll+=mv('catch_all'); a.invalid+=mv('invalid'); a.disposable+=mv('disposable'); a.unknown+=mv('unknown'); a.errd+=mv('error'); a.skipped+=mv('skipped');
a.verifying+=c(r=>r.Status==='verifying');
a.preserved+=c(r=>r._preserved===true);
a.blanked+=c(r=>r._blanked===true);
a.reverified+=c(r=>r._wasDone===true);
a.p0+=c(r=>r._mvCol==='MV P0'); a.p1+=c(r=>r._mvCol==='MV P1'); a.p2+=c(r=>r._mvCol==='MV P2'); a.p3+=c(r=>r._mvCol==='MV P3');
a.recordsOut+=rows.length;
const recordsOut=a.recordsOut;
const cap=Number(p['Max Rows'])||100000;
const isFinal=recordsOut>=Math.min(recIn,cap);
const ms=Date.parse(start);
const dur=ms?Math.round((Date.now()-ms)/1000):null;
const trig=p['_launchRecordId']?'record':'form';
const pct=(n)=>recordsOut?Math.round((n/recordsOut)*1000)/10:0;
const desc=[
'**'+recIn+' read, '+recordsOut+' updated, '+a.errd+' errored**',
'',
'**Table:** '+target+(p['View']?' · view '+p['View']:''),
'**Launch:** '+trig+'-launched · MillionVerifier pass, catch-alls handed to the BounceBan Poller',
'',
'**Verdicts**',
'- **ok:** '+a.ok+' ('+pct(a.ok)+'%)',
'- **catch_all:** '+a.catchAll,
'- **invalid:** '+a.invalid,
'- **disposable:** '+a.disposable,
'- **unknown:** '+a.unknown,
'- **errored:** '+a.errd+' · **skipped, no email on the row:** '+a.skipped,
'',
'**Verdict written into**',
'- MV P0: '+a.p0+' · MV P1: '+a.p1+' · MV P2: '+a.p2+' · MV P3: '+a.p3,
'',
'**Address safety**',
'- Existing Final Email kept through an indeterminate or errored check: '+a.preserved,
'- Cleared, definitive invalid or disposable only: '+a.blanked,
'- Rows already Status=done that were re-verified: '+a.reverified,
'',
'**Sent to BounceBan (Status=verifying):** '+a.verifying,
'',
'**Duration:** '+(dur!=null?dur+'s':'n/a')
].join('\n');
return [{ json:{ 'Automation':'Verify Emails', 'Run at': start||new Date().toISOString(), 'Target': target, 'Records In': recIn, 'Records Out': recordsOut, 'Execution ID': String($execution.id), 'Execution Link': 'https://n8n.flowroots.com/workflow/'+wfid+'/executions/'+$execution.id, 'Status': isFinal?(a.errd?'Succeeded with errors':'Succeeded'):'Running', 'Trigger': trig, 'Errors': a.errd, 'Duration s': dur, 'Description': desc } }];