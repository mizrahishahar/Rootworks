// Handoff Tick: the live Running row, written after every batch. The email hand-off is not made
// here: it fires ONCE per run, after the last batch closed (ruled 2026-09-03 after eight
// per-batch calls spawned forty executions and the droplet ran out of memory), against the People
// view "Not Waterfalled". The run so far is read from every Pass Result run (run by run, until a
// run index does not exist). The item out is the row, nothing else, so Stamp Progress can
// auto-map it.
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
let batchCount=0, total=0; try{ const s=$('Make Batches').first().json._stats||{}; total=Number(s.companiesIn)||0; batchCount=Number(s.batches)||0; }catch(e){}
const runs=(name)=>{ const out=[]; for(let i=0;i<10000;i++){ let it=null; try{ it=$(name).all(0,i); }catch(e){ break; } if(!it||!it.length) break; out.push(it); } return out; };
const batches=runs('Pass Result').map(r=>r[0].json||{});
const closed=batches.filter(x=>x.status==='closed').length;
const written=batches.reduce((a,x)=>a+(Number(x.written)||0),0);
const inp=$input.first().json||{};
const out={
  'Execution ID': String($execution.id),
  'Automation': 'Enrich Contacts',
  'Trigger': p.trigger||'form',
  'Status': 'Running',
  'Run at': p.startedAt,
  'Target': (cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+')',
  'Records In': total,
  'Records Out': written,
  'Description': '**Running: '+closed+' of '+batchCount+' batches closed ('+batches.length+' launched, one at a time), '+written+' people rows written so far; batch '+(Number(inp.batchNum)||0)+' '+(inp.status||'closed')+(inp.reason?(' ('+inp.reason+')'):'')+'. The email hand-off fires once, after the last batch.**',
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(p.clientRecId) out['Client']=[p.clientRecId];
return [{ json: out }];
