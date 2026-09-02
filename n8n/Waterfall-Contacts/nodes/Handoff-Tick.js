// Handoff Tick: closes one lane group with the live Running row. This group's hand-off outcome is
// read from the node's own input (Fire Waterfall's answer, or the view check when People has no
// "Not Waterfalled" view: Fire Waterfall did not run this group, and reading it by name would
// return an older group's answer). The run so far is read from every Lane Results run and every
// Fire Waterfall run (run by run, until a run index does not exist): batches launched and closed,
// people written, hand-offs fired. No Tally here, no read-add-write (ruled 2026-09-02): the batch
// rows carry the counters, the close reads them by prefix. The item out is the row, nothing else,
// so Stamp Progress can auto-map it; Stop? reads the stop verdict from Lane Results.
const p=$('Launch Params').first().json;
const cfg=$('Find Tables').first().json;
let total=0, batchCount=0; try{ const s=$('Make Batches').first().json._stats||{}; total=Number(s.companiesIn)||0; batchCount=Number(s.batches)||0; }catch(e){}
const runs=(name)=>{ const out=[]; for(let i=0;i<10000;i++){ let it=null; try{ it=$(name).all(0,i); }catch(e){ break; } if(!it||!it.length) break; out.push(it); } return out; };
const groups=runs('Lane Results').map(r=>r[0].json||{});
const lanes=[].concat.apply([], groups.map(g=>Array.isArray(g.lanes)?g.lanes:[]));
const closed=lanes.filter(l=>l.status==='closed').length;
const written=lanes.reduce((a,l)=>a+(Number(l.written)||0),0);
const isFired=(j)=>{ if(!j) return false; if(j.error&&j.statusCode===undefined) return /timeout|timed out|ETIMEDOUT|ESOCKETTIMEDOUT/i.test(String((j.error&&j.error.message)||'')); const s=Number(j.statusCode)||0; return s>=200&&s<300; };
const fires=runs('Fire Waterfall').map(r=>r[0].json||{});
const fired=fires.filter(isFired).length;
const inp=$input.first().json||{};
const thisGroup=(inp.hasView===false)?'skipped, People has no view "Not Waterfalled"':(isFired(inp)?'hand-off fired':'hand-off failed');
const out={
  'Execution ID': String($execution.id),
  'Automation': 'Waterfall Contacts',
  'Trigger': p.trigger||'form',
  'Status': 'Running',
  'Run at': p.startedAt,
  'Target': (cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+')',
  'Records In': total,
  'Records Out': written,
  'Description': '**Running: '+closed+' of '+batchCount+' batches closed ('+lanes.length+' launched, three lanes at a time), '+written+' people written, '+fired+' hand-off'+(fired===1?'':'s')+' fired; this group: '+thisGroup+'**',
  'Execution Link': 'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id
};
if(p.clientRecId) out['Client']=[p.clientRecId];
return [{ json: out }];
