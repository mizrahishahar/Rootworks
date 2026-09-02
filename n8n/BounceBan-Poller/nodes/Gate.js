// 2026-09-02: three flags now ride with every item so the run row can tell the three outcomes
// apart: _submitted (BounceBan accepted the address and gave back a verification id), _settled
// (a real BounceBan verdict came back) and _timedOut (the hour cap expired first and the verdict
// below is the fallback, not BounceBan's answer). Build Update deliberately ignores them: Update
// Row auto-maps its input, so only column keys may ever reach it.
const BBOK=['deliverable','undeliverable','risky','unknown'];
const initAll=$('Init').all();
const t0=(initAll[0]&&initAll[0].json._t0)||Date.now();
const elapsed=Date.now()-t0;
const MAX=3600000;
const polls=$input.all();
const en=polls.map((p,idx)=>{ const j=p.json||{}; const c=(initAll[idx]&&initAll[idx].json)||{}; const res=BBOK.includes(j.result)?j.result:''; return {res,ready:!!res,c,j}; });
const anyPending=en.some(e=>!e.ready && e.c.id) && elapsed<MAX;
const w=elapsed<30000?15:elapsed<120000?30:elapsed<300000?60:180;
return en.map(e=>({ json:{ rowId:e.c.rowId, email:e.c.email, slot:e.c.slot, tableId:e.c.tableId, baseId:e.c.baseId, id:e.c.id, _t0:e.c._t0, result: e.ready? e.res : (anyPending? '' : (e.c.id? ((e.j.result||e.j.state)||'risky') : 'error')), _loop:anyPending, _nextWaitSec:w, _submitted:!!e.c.id, _settled:e.ready, _timedOut:(!e.ready && !!e.c.id && !anyPending) } }));
