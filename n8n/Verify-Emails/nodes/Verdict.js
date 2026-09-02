const row=$('Read Records').item.json; const f=row.fields||{};
const prior=((f['Final Email']||'')+'').trim();
const priorSrc=((f['Email Source']||f.Source||'')+'');
const wasDone=((f.Status||'')+'')==='done';
const existing=((prior||f.Email||(f.public_emails_clean||'').split(',')[0])||'').trim();
const slot=priorSrc||'P0';
// Write the verdict into the tier column the address actually came from. Fall back to MV P0 when the
// slot is not a known tier, or when that tier column does not exist on this table.
let cols=[]; try{ cols=$('Resolve Table').first().json.fieldNames||[]; }catch(e){}
let mvCol='MV '+slot;
if(!/^P[0-3]$/.test(slot)||(cols.length&&!cols.includes(mvCol))) mvCol='MV P0';
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
const mvOut= existing?mvVal(mv0):SK;
// A definitive negative is the only reason to clear an address. An indeterminate result (catch_all,
// unknown), an API error, or a missing response must never blank a Final Email that was already there.
const definitiveBad=!!(mv0&&(mv0.result==='invalid'||mv0.result==='disposable'));
const out={ id:row.id, 'BB':bb, 'Status':status, _pendEmail:pe, _pendSlot:ps, _mv:mvOut, _mvCol:mvCol, _wasDone:wasDone };
out[mvCol]=mvOut;
if(resolved){ out['Final Email']=final; out['Email Source']=source; out._preserved=false; out._blanked=false; }
else if(prior&&!definitiveBad){ out['Final Email']=prior; out['Email Source']=priorSrc||'none'; out._preserved=true; out._blanked=false; }
else { out['Final Email']=''; out['Email Source']='none'; out._blanked=!!prior; out._preserved=false; }
return { json: out };