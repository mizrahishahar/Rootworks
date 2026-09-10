// Gate: the poll answers (one per Init item, aligned by index; every item is polled every round,
// the proven poller shape) folded onto the carriers from Init. Loop while any submitted address has
// no verdict and the 60-minute cap has not passed; the wait grows 15, 30, 60, 180 s. An address
// with no verdict at the cap keeps result '' (the row stays verifying for the next sweep).
const BBOK=['deliverable','undeliverable','risky','unknown'];
const base=$('Init').all().map(i=>i.json||{});
const polls=$input.all().map(i=>i.json||{});
const t0=Number((base[0]||{})._t0)||Date.now();
const elapsed=Date.now()-t0;
const MAX=3600000;
const out=base.map((c,idx)=>{ const j=polls[idx]||{}; const res=(c.id&&BBOK.indexOf(j.result)>-1)?j.result:''; return Object.assign({},c,{ result:res }); });
const anyPending=out.some(c=>c.id&&!c.result)&&elapsed<MAX;
const w=elapsed<30000?15:elapsed<120000?30:elapsed<300000?60:180;
return out.map(c=>({ json:Object.assign({},c,{ _loop:anyPending, _nextWaitSec:w, _elapsedS:Math.round(elapsed/1000) }) }));
