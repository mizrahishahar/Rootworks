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
if(!sd._wfLogTotals || sd._wfLogTotals.execId!==String($execution.id)){ sd._wfLogTotals={ execId:String($execution.id), ok:0, catchAll:0, invalid:0, disposable:0, unknown:0, errd:0, skipped:0, verifying:0, recordsOut:0, preserved:0, blanked:0, reverified:0, p0:0, p1:0, p2:0, p3:0, written:0, writeErrors:0, writeFails:[], writeWhy:[] }; }
const a=sd._wfLogTotals;
a.written=Number(a.written)||0; a.writeErrors=Number(a.writeErrors)||0;
a.writeFails=Array.isArray(a.writeFails)?a.writeFails:[];
a.writeWhy=Array.isArray(a.writeWhy)?a.writeWhy:[];
a.ok+=mv('ok'); a.catchAll+=mv('catch_all'); a.invalid+=mv('invalid'); a.disposable+=mv('disposable'); a.unknown+=mv('unknown'); a.errd+=mv('error'); a.skipped+=mv('skipped');
a.verifying+=c(r=>r.Status==='verifying');
a.preserved+=c(r=>r._preserved===true);
a.blanked+=c(r=>r._blanked===true);
a.reverified+=c(r=>r._wasDone===true);
a.p0+=c(r=>r._mvCol==='MV P0'); a.p1+=c(r=>r._mvCol==='MV P1'); a.p2+=c(r=>r._mvCol==='MV P2'); a.p3+=c(r=>r._mvCol==='MV P3');
a.recordsOut+=rows.length;
const recordsOut=a.recordsOut;

// The writer's count-back. Records Out is what Airtable confirmed, never what the verdicts produced,
// so a partial write reads as a partial run instead of a clean one. Refused rows are named.
try{
  const wc=$('Write Check').first().json||{};
  a.written+=Number(wc.written)||0;
  a.writeErrors+=Number(wc.writeErrors)||0;
  for(const id of (wc.failed||[])){ if(a.writeFails.length<50) a.writeFails.push(String(id)); }
  for(const w of (wc.writeReasons||[])){ if(a.writeWhy.length<10&&a.writeWhy.indexOf(String(w))<0) a.writeWhy.push(String(w)); }
}catch(e){}
const written=a.written;
const cap=Number(p['Max Rows'])||100000;
const isFinal=recordsOut>=Math.min(recIn,cap);
const ms=Date.parse(start);
const dur=ms?Math.round((Date.now()-ms)/1000):null;
const trig=p['_launchRecordId']?'record':'form';
const pct=(n)=>recordsOut?Math.round((n/recordsOut)*1000)/10:0;
const desc=[
'**'+recIn+' read, '+written+' updated, '+a.errd+' errored**'+(a.writeErrors?' · '+a.writeErrors+' rows Airtable refused':''),
'',
'**Table:** '+target+(p['View']?' · view '+p['View']:''),
'**Launch:** '+trig+'-launched · MillionVerifier pass, catch-alls handed to the BounceBan Poller · rows written 10 per Airtable request',
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
'**Rows written (confirmed by Airtable):** '+written+' of '+recordsOut+' produced'
].concat(a.writeErrors?['','**Write failures (Airtable refused the row; it was NOT updated and is still retryable)**',
  '- **Rows refused:** '+a.writeErrors,
  '- **Record ids:** '+(a.writeFails.length?a.writeFails.slice(0,25).join(', ')+(a.writeFails.length>25?' … (+'+(a.writeFails.length-25)+' more)':''):'none captured')]
  .concat(a.writeWhy.map(w=>'- '+w)):[])
 .concat(['','**Duration:** '+(dur!=null?dur+'s':'n/a')]).join('\n');
return [{ json:{ 'Automation':'Verify Emails', 'Run at': start||new Date().toISOString(), 'Target': target, 'Records In': recIn, 'Records Out': written, 'Execution ID': String($execution.id), 'Execution Link': 'https://n8n.flowroots.com/workflow/'+wfid+'/executions/'+$execution.id, 'Status': isFinal?((a.errd||a.writeErrors)?'Succeeded with errors':'Succeeded'):'Running', 'Trigger': trig, 'Errors': a.errd+a.writeErrors, 'Duration s': dur, 'Description': desc } }];