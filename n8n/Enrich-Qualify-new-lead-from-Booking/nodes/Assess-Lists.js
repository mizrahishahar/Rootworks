// Tier 3 verdict: the first table holding the booker's company domain makes the lead ours (Sourced).
const plan=$('Plan List Search').all().map(i=>i.json);
if(plan.length===1&&plan[0]._empty) return [{ json:{ ours:false, tier:'', why:plan[0].reason||'no lists to check', tableName:'', tablesChecked:0 } }];
const results=$input.all().map(i=>i.json);
let hit=null;
results.forEach((r,i)=>{ const recs=(r&&Array.isArray(r.records))?r.records:[]; if(!hit&&recs.length){ hit=plan[i]||{}; } });
if(hit) return [{ json:{ ours:true, tier:'Sourced', why:'company domain is on our list '+(hit.tableName||hit.tableId), tableName:hit.tableName||'', tablesChecked:plan.length } }];
return [{ json:{ ours:false, tier:'', why:'company domain is on none of the client\'s '+plan.length+' list table(s)', tableName:'', tablesChecked:plan.length } }];
