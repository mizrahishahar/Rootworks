const wfid='iNzuePWU2UoByJ7U';
let r=null;
try{ r=$('Read Records').first().json; }catch(e){ r=null; }
if(!r||!r._execId){ let p={}; try{ p=$('Params').first().json||{}; }catch(e){}
  let st=''; try{ st=$('Email Guard').first().json.startedAt||''; }catch(e){}
  r={ _execId:String($execution.id), _tableId:p['Table ID']||'', _view:p['View']||'', _startedAt:st||new Date().toISOString(), _trigger:'form', _total:0, _clientId:'' }; }
const eid=String(r._execId);
const start=r._startedAt||new Date().toISOString();
const recIn=Number(r._total)||0;

// Prior totals come from the run's own Hub row, not from static data.
// Static data written inside a sub-execution is not persisted back; the row is.
const BLANK={resolved:0,verifying:0,noEmail:0,errored:0,p0:0,p1:0,p2:0,p3:0,ffP2:0,ffP3:0,causes:{}};
let a=Object.assign({},BLANK);
try{
  const prior=$('Read Log Row').first().json;
  const raw=prior&&prior.fields?prior.fields.Tally:null;
  if(raw){ const parsed=JSON.parse(String(raw)); if(parsed&&String(parsed.execId)===eid){ a=Object.assign({},BLANK,parsed); a.causes=parsed.causes||{}; } }
}catch(e){ a=Object.assign({},BLANK); }

let rows=[]; try{ rows=$('To Airtable').all().map(i=>i.json); }catch(e){}
const c=(f)=>rows.filter(f).length;
a.resolved+=c(x=>x.Status==='done');
a.verifying+=c(x=>x.Status==='verifying');
a.noEmail+=c(x=>x.Status==='no_email_found');
a.errored+=c(x=>x.Status==='error');
a.p0+=c(x=>x.Status==='done'&&x.Source==='P0');
a.p1+=c(x=>x.Status==='done'&&x.Source==='P1');
a.p2+=c(x=>x.Status==='done'&&x.Source==='P2');
a.p3+=c(x=>x.Status==='done'&&x.Source==='P3');

// This batch's finder refusals, taken from the in-memory counter which IS reliable within one execution.
try{
  const sd=$getWorkflowStaticData('global');
  const ff=sd._wfFinderFails;
  if(ff&&String(ff.execId)===String($execution.id)){
    a.ffP2+=(ff.p2||0); a.ffP3+=(ff.p3||0);
    for(const k of Object.keys(ff.causes||{})){ a.causes[k]=(a.causes[k]||0)+ff.causes[k]; }
    ff.p1=0; ff.p2=0; ff.p3=0; ff.causes={};
  }
}catch(e){}

a.execId=eid;
const ffTotal=a.ffP2+a.ffP3;
const topCause=(tier)=>{ const m=a.causes||{}; let best='',n=0; for(const k of Object.keys(m)){ if(k.indexOf(tier+':')===0&&m[k]>n){ n=m[k]; best=k.slice(tier.length+1); } } return best; };
const ffLine=(tier,label,n)=>{ const tc=n?topCause(tier):''; return '- **'+tier+' '+label+':** '+n+' call'+(n===1?'':'s')+' failed'+(tc?' ('+tc+')':''); };
const recordsOut=a.resolved+a.verifying;
const accounted=a.resolved+a.verifying+a.noEmail+a.errored;
const isFinal=recIn===0 || accounted>=recIn;
const ms=Date.parse(start);
const dur=ms?Math.round((Date.now()-ms)/1000):null;
const trig=r._trigger||'form';
const viewTxt=r._view?(' · view: '+r._view):'';
const desc=[
'**'+recIn+' read, '+a.resolved+' resolved, '+a.verifying+' verifying, '+a.errored+' errored**'+(ffTotal?' · '+ffTotal+' finder calls refused':''),
'',
'**Launch:** '+trig+'-launched · batched 100/sub-execution'+viewTxt+' · find + verify (MV P0 / Trykitt / LeadMagic / Prospeo / BounceBan)',
'',
'**Progress:** '+accounted+' of '+recIn+' accounted',
'',
'**Results**',
'- **Resolved (Status=done):** '+a.resolved+' · P0 existing '+a.p0+' · P1 Trykitt '+a.p1+' · P2 LeadMagic '+a.p2+' · P3 Prospeo '+a.p3,
'- **Handed to BounceBan (pending async verdicts):** '+a.verifying,
'- **No email found (finder answered, nothing there):** '+a.noEmail,
'- **Errored (never actually looked up, retryable):** '+a.errored,
'- **Rows written (resolved+verifying):** '+recordsOut
].concat(ffTotal?['','**Finder failures (the API refused the call, not a negative)**',ffLine('P2','LeadMagic',a.ffP2),ffLine('P3','Prospeo',a.ffP3)]:[]).concat(['','**Duration:** '+(dur!=null?dur+'s':'n/a')]).join('\n');
return [{ json:{ 'Automation':'Waterfall Emails', 'Run at': start, 'Target': r._tableId, 'View': r._view||'', 'Records In': recIn, 'Records Out': recordsOut, 'Execution ID': eid, 'Execution Link': 'https://n8n.flowroots.com/workflow/'+wfid+'/executions/'+eid, 'Status': isFinal?((a.errored||ffTotal)?'Succeeded with errors':'Succeeded'):'Running', 'Trigger': trig, 'Errors': a.errored, 'Duration s': dur, 'Tally': JSON.stringify(a), 'Description': desc } }];