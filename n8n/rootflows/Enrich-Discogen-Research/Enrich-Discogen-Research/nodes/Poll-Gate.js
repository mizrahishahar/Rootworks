// Poll Gate: the status answers (one per carrier, aligned by index; every open task is polled every
// round, the proven poller shape) folded onto the carriers. A task is settled when DiscoGen says
// completed, failed or cancelled; its results map (domain -> answer) and estimated cost ride on the
// carrier. Loop while any task is open and the 8-hour cap has not passed; the wait grows 30, 60,
// 120, 300 s. A task still open at the cap is reported as timed out with its id, so it can be read
// by hand: DiscoGen keeps the task.
const MAX=8*3600*1000;
const carriers=$('Poll Input').all().map(i=>i.json||{});
const polls=$input.all().map(i=>i.json||{});
const t0=Number((carriers[0]||{})._t0)||Date.now();
const elapsed=Date.now()-t0;
const DONE=['completed','failed','cancelled','canceled','error'];
const out=carriers.map((c,idx)=>{
  if(!c.taskId||DONE.indexOf(c.status)>-1) return c;
  const j=polls[idx]||{}; const b=(j.body!==undefined)?j.body:j;
  const parsed=(typeof b==='string')?(()=>{ try{ return JSON.parse(b); }catch(e){ return {}; } })():(b||{});
  if(j.error&&j.body===undefined&&parsed.status===undefined) return Object.assign({},c,{ pollErr:String((j.error&&j.error.message)||j.error||'poll failed').slice(0,160) });
  const status=String(parsed.status||c.status||'in_progress');
  const results=(status==='completed'&&parsed.results&&typeof parsed.results==='object')?parsed.results:(c.results||null);
  return Object.assign({},c,{ status, progress:Number(parsed.progress)||c.progress||0, results, format:parsed.response_format||c.format||null, cost:Number(parsed.estimated_cost)||c.cost||0, pollErr:'', failReason:(status==='failed'||status==='error')?String(parsed.error||parsed.message||parsed.detail||'task failed').slice(0,200):(c.failReason||'') });
});
const anyOpen=out.some(c=>c.taskId&&DONE.indexOf(c.status)<0);
const loop=anyOpen&&elapsed<MAX;
const w=elapsed<120000?30:elapsed<600000?60:elapsed<1800000?120:300;
return out.map(c=>({ json:Object.assign({},c,{ _loop:loop, _nextWaitSec:w, _elapsedS:Math.round(elapsed/1000), timedOut:(c.taskId&&DONE.indexOf(c.status)<0&&!loop) }) }));
