const row=$('Read Records').item.json; const f=row.fields||{}; const existing=((f.Email||(f.public_emails_clean||'').split(',')[0])||'').trim();
const G=(n)=>{ try{ const v=$(n).item.json; return (v&&typeof v==='object')?v:null; }catch(e){ return null; } };
const mv0=G('MV P0'),bb0=G('BB P0'),tk=G('Trykitt Find'),mv1=G('MV P1'),bb1=G('BB P1'),lm=G('LeadMagic Find'),mv2=G('MV P2'),bb2=G('BB P2');
const SK='skipped';
const tkE=tk?((tk.email&&tk.email!=='no-results-found')?tk.email:''):'';
const lmE=lm?(lm.email||''):'';
const MVOK=['ok','catch_all','invalid','disposable','unknown'];
const BBOK=['deliverable','undeliverable','risky','unknown'];
const mvVal=(r)=> r? (MVOK.includes(r.result)? r.result : 'error') : SK;
const bbVal=(r)=>{ const s=r?(r.state||r.result):null; return r? (BBOK.includes(s)? s : 'error') : SK; };
const mvErr=(r)=> r && (r.resultcode===4 || (r.error&&r.error!=='') || !MVOK.includes(r.result));
const bbErr=(r)=> r && ((r.error&&r.error!=='') || !BBOK.includes(r.state||r.result));
const bbDeliv=(r)=> r && (r.state==='deliverable'||r.result==='deliverable');
let final='',source='none',errored=false;
if(existing){ if(mv0&&mv0.result==='ok'){final=existing;source='P0';} else if(mv0&&mv0.result==='catch_all'){ if(bbDeliv(bb0)){final=existing;source='P0';} else if(bbErr(bb0)){errored=true;} } else if(mvErr(mv0)){errored=true;} }
if(!final&&tkE){ if(mv1&&mv1.result==='ok'){final=tkE;source='P1';} else if(mv1&&mv1.result==='catch_all'){ if(bbDeliv(bb1)){final=tkE;source='P1';} else if(bbErr(bb1)){errored=true;} } else if(mvErr(mv1)){errored=true;} }
if(!final&&lmE){ if(mv2&&mv2.result==='ok'){final=lmE;source='P2';} else if(mv2&&mv2.result==='catch_all'){ if(bbDeliv(bb2)){final=lmE;source='P2';} else if(bbErr(bb2)){errored=true;} } else if(mvErr(mv2)){errored=true;} }
const status = final?'done':(errored?'error':'no_email_found');
return { json: { id: row.id, 'MV P0': existing? mvVal(mv0) : SK, 'BB P0': (existing&&mv0&&mv0.result==='catch_all')? bbVal(bb0) : SK, 'P1 (Trykitt)': tk? (tk.email||'no-results-found') : SK, 'MV P1': tkE? mvVal(mv1) : SK, 'BB P1': (tkE&&mv1&&mv1.result==='catch_all')? bbVal(bb1) : SK, 'P2 (LeadMagic)': lm? (lmE||'no-results-found') : SK, 'MV P2': lmE? mvVal(mv2) : SK, 'BB P2': (lmE&&mv2&&mv2.result==='catch_all')? bbVal(bb2) : SK, 'Final Email': final, 'Source': source, 'Status': status } };