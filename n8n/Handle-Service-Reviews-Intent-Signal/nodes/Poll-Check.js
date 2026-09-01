// Poll Check: one pass of the ICP poll loop. Reads the discogen status; done when the task
// completed or failed, or after 20 passes (5 minutes at 15 s), which is reported as an error.
// Reused verbatim from Handle Hiring Intent Signal.
const j=$input.first().json||{};
const status=Number(j.statusCode)||0;
let b=j.body; if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b=null; } }
const taskId=String(($('Prep Poll').first().json||{}).task_id||'');
const pass=Number($runIndex)||0;
const st=b&&b.status?String(b.status):'';
if(st==='completed') return [{ json: { task_id:taskId, done:true, results:(b.results||{}), error:'', passes:pass+1 } }];
if(st==='failed'||st==='error'||status>=400) return [{ json: { task_id:taskId, done:true, results:null, error:'discogen '+(st||('HTTP '+status))+' '+String((b&&(b.error||b.detail||b.message))||'').slice(0,120), passes:pass+1 } }];
if(pass+1>=20) return [{ json: { task_id:taskId, done:true, results:null, error:'ICP check timed out after '+(pass+1)+' polls', passes:pass+1 } }];
return [{ json: { task_id:taskId, done:false, results:null, error:'', passes:pass+1 } }];
