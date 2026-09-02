// Lane Results: the lane calls of this group (Fire Lanes, fullResponse items aligned one to one
// with the batch items Loop Lanes dealt) -> one item: per-lane outcome and the group's stop
// verdict. A lane closed when the batch door answered 2xx with its counters; its Hub row already
// exists, the batch writes the row before it responds. 5xx is a crash (the Error Logger holds
// that batch's Failed row under the batch's own execution id). A transport error is a timeout or
// an unreachable door; a timed-out batch may still be running and will write its own row, which
// the close reads by prefix if it landed in time. The parent never retries a lane: a retry would
// run the paid tiers twice. stop = a batch whose every paid call died (allFailed): no further
// groups are launched; the lanes of this group already closed.
let sent=[]; try{ sent=$('Loop Lanes').all().map(i=>i.json); }catch(e){}
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const lanes=[];
$input.all().forEach((it,i)=>{
  const req=sent[i]||{}; const j=it.json||{};
  const lane={ batchNum:Number(req.batchNum)||0, companiesIn:(Array.isArray(req.companies)?req.companies:[]).length, status:'', written:0, allFailed:false, reason:'' };
  if(j.error&&j.statusCode===undefined){
    const m=String((j.error&&(j.error.message||j.error.description))||'call failed');
    lane.status=/timeout|timed out|ETIMEDOUT|ESOCKETTIMEDOUT|ECONNRESET|aborted/i.test(m)?'timeout':'unreachable';
    lane.reason=m.slice(0,200); lanes.push(lane); return;
  }
  const status=Number(j.statusCode)||0; const b=parse(j.body===undefined?null:j.body);
  if(!(status>=200&&status<300)){
    const why=b&&typeof b==='object'?String(b.message||b.description||''):(typeof j.body==='string'?j.body:'');
    lane.status='crashed'; lane.reason=('batch door HTTP '+status+' '+why).trim().slice(0,200); lanes.push(lane); return;
  }
  const s=(b&&typeof b==='object')?b:{};
  lane.status='closed'; lane.written=Number(s.written)||0; lane.allFailed=!!s.allFailed;
  if(lane.allFailed){ lane.status='allFailed'; lane.reason=String((Array.isArray(s.failReasons)&&s.failReasons[0])||'every paid call failed after retry').slice(0,200); }
  lanes.push(lane);
});
if(!lanes.length) throw new Error('Lane Results received no lane answers; Fire Lanes answers once per batch item, this should not happen.');
return [{ json: {
  group: $runIndex+1,
  lanes: lanes,
  stop: lanes.some(l=>l.allFailed),
  closed: lanes.filter(l=>l.status==='closed').length,
  written: lanes.reduce((a,l)=>a+(Number(l.written)||0),0)
} }];
