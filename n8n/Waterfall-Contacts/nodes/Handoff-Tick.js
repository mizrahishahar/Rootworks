// Handoff Tick: the live Running row, written after every writer batch and once more after the
// AI-Ark lane's row landed. THE EMAIL HAND-OFF FIRES ONCE PER RUN, never per batch (ruled
// 2026-09-03 after the 10:13 incident: the door was called inside the writer loop, so a run with
// eight batches launched eight Waterfall Emails runs, each spawning its own BounceBan Pollers, and
// about forty executions died together when the n8n droplet ran out of memory; 36 of 37 signalled
// companies got no contacts and 141 People rows were left at Status = verifying). The writer
// batches now tick straight through here with no door call at all. The door is called once, after
// the writer lane drained AND the AI-Ark lane's row landed, against the People view
// "Not Waterfalled", which already selects the relevant people with no email yet, so one call
// drains everything the run produced. This is how the retired "Add Intent Leads" machines behaved.
// This pass's outcome is read from the node's own input, never by node name: a writer batch item
// (mode 'writer', from Pass Result), Fire Waterfall's answer, or the view check when the door was
// not called (Fire Waterfall did not run, and reading it by name would return an older answer).
// The run so far is read from every Pass Result run and the Fire Waterfall run (run by run,
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
const thisPass=(inp.mode==='writer')
  ?('writer batch '+(Number(inp.batchNum)||0)+' closed, no hand-off (it fires once, after the lane drains)')
  :((inp.hasView===false)
    ?(inp.metaOk===false?'the one hand-off skipped, the base meta could not be read':'the one hand-off skipped, People has no view "Not Waterfalled"')
    :(isFired(inp)?'the one hand-off fired':'the one hand-off failed'));
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
  'Description': '**Running: '+stage+', '+written+' people written by the writer so far, '+fired+' of one hand-off fired (the email door is called once per run, after the lane drains, never per batch); this time: '+thisPass+'**',
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(p.clientRecId) out['Client']=[p.clientRecId];
return [{ json: out }];
