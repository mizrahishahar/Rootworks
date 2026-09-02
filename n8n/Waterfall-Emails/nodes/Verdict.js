const row=$('Read Records').item.json; const f=row.fields||{};
// public_emails_clean is a lookup on a register-shaped People table (an array); the first clean address is the fallback either way.
const existing=((f.Email||[].concat(f.public_emails_clean||'').join(',').split(',')[0])||'').trim();
const G=(n)=>{ try{ const v=$(n).item.json; return (v&&typeof v==='object')?v:null; }catch(e){ return null; } };
const mv0=G('MV P0'),tk=G('Trykitt Find'),mv1=G('MV P1'),lm=G('LeadMagic Find'),mv2=G('MV P2'),pr=G('Prospeo Find'),mv3=G('MV P3');
const SK='skipped';
const body=(o)=>{ if(o&&typeof o.data==='string'){ try{ return JSON.parse(o.data); }catch(e){ return null; } } return o; };
const failed=(o)=>{ if(!o) return false; if(typeof o.data==='string') return true; if(o.error===true) return true; if(typeof o.error==='string'&&o.error!=='') return true; if(o.success===false) return true; if(Array.isArray(o.errors)&&o.errors.length) return true; if(o.code&&o.title&&o.detail) return true; const st=Number(o.status); if(Number.isFinite(st)&&(st<200||st>=300)) return true; if(Object.keys(o).length===0) return true; return false; };
const cause=(o)=>{ const b=body(o); if(!b) return 'unparseable_body'; const c=b.code||b.error_code||b.title||b.message||(typeof b.error==='string'?b.error:'')||('http_'+(b.status!==undefined?b.status:'unknown')); return String(c).slice(0,40); };
// A finder with no credits is not an error and never blocks a row. The tier records "no-credits",
// the run log flags it, and the waterfall carries on to the next provider.
const DRY=(o)=>{ if(!o||typeof o!=='object') return false; const b=body(o)||{}; const s=Number(b.status||b.statusCode||0); const t=(String(b.code||'')+' '+String(b.error_code||'')+' '+String(b.title||'')+' '+String(b.detail||'')+' '+String(b.message||'')+' '+(typeof b.error==='string'?b.error:'')).toLowerCase(); if(s===402) return true; return t.indexOf('insufficient_credit')>=0||t.indexOf('insufficient credit')>=0||t.indexOf('out of credits')>=0||t.indexOf('no credits')>=0; };
// MillionVerifier is the exception: it gates every tier, so without it nothing can resolve at all.
const MVDRY=(r)=>{ if(!r||typeof r!=='object') return false; const e=String(r.error||'').toLowerCase(); if(e.indexOf('insufficient credit')>=0||e.indexOf('no credit')>=0||e.indexOf('out of credit')>=0) return true; const c=Number(r.credits); return Number.isFinite(c)&&c<0; };
for(const p of [['MV P0',mv0],['MV P1',mv1],['MV P2',mv2],['MV P3',mv3]]){ if(MVDRY(p[1])){ throw new Error('MillionVerifier is out of credits ('+p[0]+', balance '+String((p[1]||{}).credits)+'). Nothing can be verified without it, so the run is stopping here. Top up and relaunch.'); } }
const tkDry=DRY(tk), lmDry=DRY(lm), prDry=DRY(pr);
const NEGATIVE=(o)=>{ const c=cause(o).toLowerCase(); return c.indexOf('no_match')>=0||c.indexOf('not_found')>=0||c.indexOf('no-results-found')>=0||c.indexOf('no results')>=0||c.indexOf('find a verified email')>=0||c.indexOf("couldn't find")>=0||c.indexOf('could not find')>=0||c.indexOf('unable to verify email')>=0; };
const tkFail=tk?(failed(tk)||!tk.jobId||typeof tk.email!=='string'):false;
const lmFail=lm?failed(lm):false;
const prFail=pr?failed(pr):false;
const lmNeg=lmFail&&NEGATIVE(lm);
const prNeg=prFail&&NEGATIVE(pr);
// out of credits never counts as a hard failure, so it can never make the row an error
const lmHard=lmFail&&!lmNeg&&!lmDry;
const prHard=prFail&&!prNeg&&!prDry;
const tkE=(tk&&!tkFail)?((tk.email&&tk.email!=='no-results-found')?tk.email:''):'';
const lmE=(lm&&!lmFail)?(lm.email||''):'';
const prPick=(o)=>{ const e=o&&o.person&&o.person.email; return (e&&e.revealed===true&&e.email&&e.email.indexOf('*')===-1)?e.email:''; };
const prE=(pr&&!prFail)?prPick(pr):'';
const answered=(!!tk&&!tkFail)||(!!lm&&!lmFail)||lmNeg||(!!pr&&!prFail)||prNeg;
const MVOK=['ok','catch_all','invalid','disposable','unknown'];
const mvVal=(r)=> r?(MVOK.includes(r.result)?r.result:'error'):SK;
const mvErr=(r)=> r&&(r.resultcode===4||(r.error&&r.error!=='')||!MVOK.includes(r.result));
const IND=(r)=> r==='catch_all'||r==='unknown';
let final='',source='none',bb='skipped',pe='',ps='',resolved=false,verifying=false,errored=false;
if(existing&&mv0){ if(mv0.result==='ok'){final=existing;source='P0';resolved=true;} else if(IND(mv0.result)){verifying=true;bb='verifying';pe=existing;ps='P0';} else if(mvErr(mv0)){errored=true;} }
if(!resolved&&!verifying&&tkE&&mv1){ if(mv1.result==='ok'){final=tkE;source='P1';resolved=true;} else if(IND(mv1.result)){verifying=true;bb='verifying';pe=tkE;ps='P1';} else if(mvErr(mv1)){errored=true;} }
if(!resolved&&!verifying&&lmE&&mv2){ if(mv2.result==='ok'){final=lmE;source='P2';resolved=true;} else if(IND(mv2.result)){verifying=true;bb='verifying';pe=lmE;ps='P2';} else if(mvErr(mv2)){errored=true;} }
if(!resolved&&!verifying&&prE&&mv3){ if(mv3.result==='ok'){final=prE;source='P3';resolved=true;} else if(IND(mv3.result)){verifying=true;bb='verifying';pe=prE;ps='P3';} else if(mvErr(mv3)){errored=true;} }
const finderFail=(lmHard||prHard)&&!answered;
const status= resolved?'done':(verifying?'verifying':((errored||finderFail)?'error':'no_email_found'));
const causes=[];
if(tkDry)causes.push('P1:no-credits');
if(lmDry)causes.push('P2:no-credits'); else if(lmHard)causes.push('P2:'+cause(lm));
if(prDry)causes.push('P3:no-credits'); else if(prHard)causes.push('P3:'+cause(pr));
const tkCell = tk?(tkDry?'no-credits':(tkFail?'no-results-found':(tk.email||'no-results-found'))):SK;
const lmCell = lm?(lmDry?'no-credits':(lmFail?(lmHard?'error':'no-results-found'):(lmE||'no-results-found'))):SK;
const prCell = pr?(prDry?'no-credits':(prFail?(prHard?'error':'no-results-found'):(prE||'no-results-found'))):SK;
return { json:{ id:row.id, 'MV P0': existing?mvVal(mv0):SK, 'P1 (Trykitt)': tkCell, 'MV P1': tkE?mvVal(mv1):SK, 'P2 (LeadMagic)': lmCell, 'MV P2': lmE?mvVal(mv2):SK, 'P3 (Prospeo)': prCell, 'MV P3': prE?mvVal(mv3):SK, 'BB':bb, 'Final Email':final, 'Email Source':source, 'Status':status, _pendEmail:pe, _pendSlot:ps, _errP1:tkDry?1:0, _errP2:(lmHard||lmDry)?1:0, _errP3:(prHard||prDry)?1:0, _failCauses:causes.join('|') } };