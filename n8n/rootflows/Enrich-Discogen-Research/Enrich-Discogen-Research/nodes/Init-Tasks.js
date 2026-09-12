// Init Tasks: the submit answers (aligned to Make Tasks by index) become the poll carriers: one item
// per task with its task_id, or a submit error named on the item. A missing credential, a 400 (no
// LLM provider on the account, no search provider with Web Search on), a 402 or a dead API are all
// errors on the task, never a crash: the run reports them on the row and moves on.
// n8n hands a node failure over as {error}: a plain string ("Credentials not found") or an object with message and description. Read both shapes.
const errMsg=(e)=>{ if(!e) return 'call failed'; if(typeof e==='string') return e; return String((e.message||'')+' '+(e.description||'')).trim()||'call failed'; };
const reqs=$('Make Tasks').all().map(i=>i.json||{}).filter(j=>!j._none);
const t0=Date.now();
const out=$input.all().map((it,i)=>{
  const q=reqs[i]||{}; const j=it.json||{};
  if(j.error&&j.body===undefined&&j.task_id===undefined){ const m=errMsg(j.error); return { json:{ idx:q.idx, count:q.count, taskId:'', status:'', progress:0, results:null, cost:0, submitErr:(/credential/i.test(m)?'no credential on the DiscoGen nodes':m).slice(0,200), _t0:t0 } }; }
  const b=(j.body!==undefined)?j.body:j; const code=Number(j.statusCode)||200;
  const parsed=(typeof b==='string')?(()=>{ try{ return JSON.parse(b); }catch(e){ return {}; } })():(b||{});
  if(code>=300||!parsed.task_id){ const why=(parsed&&(parsed.detail||parsed.message||parsed.error))||JSON.stringify(parsed).slice(0,160); return { json:{ idx:q.idx, count:q.count, taskId:'', status:'', progress:0, results:null, cost:0, submitErr:('HTTP '+code+' '+(typeof why==='string'?why:JSON.stringify(why))).slice(0,200), _t0:t0 } }; }
  return { json:{ idx:q.idx, count:q.count, taskId:String(parsed.task_id), status:String(parsed.status||'in_progress'), progress:0, results:null, cost:0, submitErr:'', _t0:t0 } };
});
if(!out.length) return [{ json:{ _none:true } }];
return out;
