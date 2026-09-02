// Handoff Tick: closes one hand-off (after every writer batch, and once more after the AI-Ark
// lane's row landed) with the live Running row. This hand-off's outcome is read from the node's own
// input (Fire Waterfall's answer, or the view check when People has no "Not Waterfalled" view:
// Fire Waterfall did not run this time, and reading it by name would return an older answer).
// The run so far is read from every Pass Result run and every Fire Waterfall run (run by run,
// until a run index does not exist), and from Ark Lane and Ark Rows Check once they have run
// (during the writer loop neither has, and both reads fall through to "not fired yet").
// No Tally here, no read-add-write (ruled 2026-09-02): the pass rows carry the counters, the close
// reads them by prefix. The item out is the row, nothing else, so Stamp Progress can auto-map it;
// the gates after it read Pass Result and Ark Rows Check.
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
let batchCount=0, total=0; try{ const s=$('Make Batches').first().json._stats||{}; total=Number(s.companiesIn)||0; batchCount=Number(s.batches)||0; }catch(e){}
const runs=(name)=>{ const out=[]; for(let i=0;i<10000;i++){ let it=null; try{ it=$(name).all(0,i); }catch(e){ break; } if(!it||!it.length) break; out.push(it); } return out; };
const batches=runs('Pass Result').map(r=>r[0].json||{});
const closed=batches.filter(x=>x.status==='closed').length;
const written=batches.reduce((a,x)=>a+(Number(x.written)||0),0);
let lane=null; try{ lane=$('Ark Lane').first().json||null; }catch(e){}
let ark=null; try{ ark=$('Ark Rows Check').first().json||null; }catch(e){}
const isFired=(j)=>{ if(!j) return false; if(j.error&&j.statusCode===undefined) return /timeout|timed out|ETIMEDOUT|ESOCKETTIMEDOUT/i.test(String((j.error&&j.error.message)||'')); const s=Number(j.statusCode)||0; return s>=200&&s<300; };
const fires=runs('Fire Waterfall').map(r=>r[0].json||{});
const fired=fires.filter(isFired).length;
const inp=$input.first().json||{};
const thisPass=(inp.hasView===false)?'skipped, People has no view "Not Waterfalled"':(isFired(inp)?'hand-off fired':'hand-off failed');
const laneStage=!lane?'AI-Ark lane not started':(lane.fire?('AI-Ark lane fired over '+(Number(lane.companiesIn)||0)+' companies'+(ark?(ark.landed?', its row landed':(ark.timedOut?', its row timed out':', waiting for its row')):'')):'AI-Ark lane not needed');
const stage=closed+' of '+batchCount+' writer batches closed ('+batches.length+' launched, one at a time), '+laneStage;
const out={
  'Execution ID': String($execution.id),
  'Automation': 'Waterfall Contacts',
  'Trigger': p.trigger||'form',
  'Status': 'Running',
  'Run at': p.startedAt,
  'Target': (cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+')',
  'Records In': total,
  'Records Out': written,
  'Description': '**Running: '+stage+', '+written+' people written by the writer so far, '+fired+' hand-off'+(fired===1?'':'s')+' fired; this time: '+thisPass+'**',
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(p.clientRecId) out['Client']=[p.clientRecId];
return [{ json: out }];
