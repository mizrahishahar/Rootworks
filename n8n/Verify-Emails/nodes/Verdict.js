// Verdict: one row's MillionVerifier result into the lane the table carries.
// Companies, the short lane (ruling 2026-09-02): the address is Email, else the first clean
// address from public_emails_clean (then written into Email, so the row shows what was verified);
// the verdict lands in MV P0, BB, Final Email, Status and nothing else. Never P1 to P3, MV P1 to
// MV P3 or Email Source on Companies.
// People, today's full lane: the address is Final Email if present, else Email, else the first
// clean address; the verdict lands in the tier column the address came from (Email Source, MV Px,
// falling back to MV P0 when the tier column is not on the table), BB, Final Email, Email Source, Status.
const row=$('Read Records').item.json; const f=row.fields||{};
let rt={}; try{ rt=$('Resolve Table').first().json||{}; }catch(e){}
const isCompanies=rt.lane==='companies';
const cols=Array.isArray(rt.fieldNames)?rt.fieldNames:[];
// public_emails_clean is plain text on Companies and a lookup (an array) on People; the first clean address either way.
const firstClean=[].concat(f.public_emails_clean||'').join(',').split(',')[0].trim();
const prior=((f['Final Email']||'')+'').trim();
const rawEmail=((f.Email||'')+'').trim();
const priorSrc=isCompanies?'':((f['Email Source']||f.Source||'')+'');
const wasDone=((f.Status||'')+'')==='done';
const existing=isCompanies?(rawEmail||firstClean):(prior||rawEmail||firstClean);
const slot=isCompanies?'P0':(priorSrc||'P0');
// Write the verdict into the tier column the address actually came from. Fall back to MV P0 when the
// slot is not a known tier, or when that tier column does not exist on this table.
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
if(resolved){ out['Final Email']=final; out._preserved=false; out._blanked=false; }
else if(prior&&!definitiveBad){ out['Final Email']=prior; out._preserved=true; out._blanked=false; }
else { out['Final Email']=''; out._blanked=!!prior; out._preserved=false; }
if(isCompanies){
  // The short lane: Email carries the address verified when the row had none and public_emails_clean gave one.
  if(!rawEmail&&existing) out['Email']=existing;
} else {
  out['Email Source']=resolved?source:((prior&&!definitiveBad)?(priorSrc||'none'):'none');
}
return { json: out };
