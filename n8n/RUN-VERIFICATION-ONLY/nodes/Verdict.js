const row=$('Read Records').item.json; const f=row.fields||{};
const existing=((f.Email||(f.public_emails_clean||'').split(',')[0])||'').trim();
const G=(n)=>{ try{ const v=$(n).item.json; return (v&&typeof v==='object')?v:null; }catch(e){ return null; } };
const mv0=G('MV P0'), bb0=G('BB P0');
const MVOK=['ok','catch_all','invalid','disposable','unknown'];
const BBOK=['deliverable','undeliverable','risky','unknown'];
const mvVal=(r)=> r?(MVOK.includes(r.result)?r.result:'error'):'skipped';
const bbVal=(r)=>{ const s=r?(r.state||r.result):null; return r?(BBOK.includes(s)?s:'error'):'skipped'; };
const bbDeliv=(r)=> r&&(r.state==='deliverable'||r.result==='deliverable');
const mvErr=(r)=> r&&(r.resultcode===4||(r.error&&r.error!=='')||!MVOK.includes(r.result));
const bbErr=(r)=> r&&((r.error&&r.error!=='')||!BBOK.includes(r.state||r.result));
let final='',errored=false;
if(existing){ if(mv0&&mv0.result==='ok')final=existing; else if(mv0&&mv0.result==='catch_all'){ if(bbDeliv(bb0))final=existing; else if(bbErr(bb0))errored=true; } else if(mvErr(mv0))errored=true; }
const status=final?'done':(errored?'error':'no_email_found');
return { json:{ id:row.id, 'MV': existing?mvVal(mv0):'skipped', 'BB': (existing&&mv0&&mv0.result==='catch_all')?bbVal(bb0):'skipped', 'Final Email':final, 'Status':status } };