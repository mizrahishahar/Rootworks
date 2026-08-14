const row=$('Read Records').item.json; const f=row.fields||{};
const prior=((f['Final Email']||'')+'').trim();
const priorSrc=(f.Source||'')+'';
const existing=((prior||f.Email||(f.public_emails_clean||'').split(',')[0])||'').trim();
const slot=priorSrc||'P0';
const G=(n)=>{ try{ const v=$(n).item.json; return (v&&typeof v==='object')?v:null; }catch(e){ return null; } };
const mv0=G('MV');
const SK='skipped';
const MVOK=['ok','catch_all','invalid','disposable','unknown'];
const mvVal=(r)=> r?(MVOK.includes(r.result)?r.result:'error'):SK;
const mvErr=(r)=> r&&(r.resultcode===4||(r.error&&r.error!=='')||!MVOK.includes(r.result));
const IND=(r)=> r==='catch_all'||r==='unknown';
let final='',source='none',bb='skipped',pe='',ps='',resolved=false,verifying=false,errored=false;
if(existing&&mv0){ if(mv0.result==='ok'){final=existing;source=slot;resolved=true;} else if(IND(mv0.result)){verifying=true;bb='verifying';pe=existing;ps=slot;} else if(mvErr(mv0)){errored=true;} }
const status= resolved?'done':(verifying?'verifying':(errored?'error':'no_email_found'));
const out={ id:row.id, 'MV': existing?mvVal(mv0):SK, 'BB':bb, 'Status':status, _pendEmail:pe, _pendSlot:ps };
if(errored && prior){ out['Final Email']=prior; out['Source']=priorSrc||'none'; }
else { out['Final Email']=final; out['Source']=source; }
return { json: out };