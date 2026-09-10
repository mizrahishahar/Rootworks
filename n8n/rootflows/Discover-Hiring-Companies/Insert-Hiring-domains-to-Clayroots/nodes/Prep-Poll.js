// Prep Poll: reads the task id the ICP check returned and starts the poll loop.
// No task id means the check never started: the loop is skipped and every company is
// reported as an ICP error downstream (never passed through as a yes).
const j=$input.first().json||{};
const status=Number(j.statusCode)||0;
let b=j.body; if(typeof b==='string'){ try{ b=JSON.parse(b); }catch(e){ b=null; } }
const taskId=b&&b.task_id?String(b.task_id):'';
if(!taskId) return [{ json: { task_id:'', done:true, results:null, error:'validate/icp HTTP '+status+' '+String((b&&(b.detail||b.error||b.message))||'no task_id').slice(0,120) } }];
return [{ json: { task_id: taskId, done:false, results:null, error:'' } }];
