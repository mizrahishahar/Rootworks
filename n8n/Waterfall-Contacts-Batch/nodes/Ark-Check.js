// Ark Check: the callback rows (Read Callbacks, one data table query per pending track id; AI-Ark
// Export Callback fills that table from every completion webhook) -> the next poll state. A row
// in state DONE settles the export: found from the row when the webhook carried statistics, else
// into toPoll for one statistics read later; no row keeps it pending. Polled every 15 s, clocked
// from submittedAt. The 4-minute cap is the safety net for exports whose webhook never arrives:
// past it, whatever is still pending moves to toPoll, where one statistics read each decides DONE
// or still PENDING. Never a hang, never a poll per export while the webhook works. The breaker's
// counters (planned, rateLimited, unserved, stoppedEarly) ride through untouched.
const WAIT_MS=15000, MAX_POLL_MS=240000;
let pend=[]; try{ pend=$('Ark Pending').all().map(i=>i.json); }catch(e){}
const prev=(pend[0]&&pend[0].state)||{ pending:[], done:[], toPoll:[], errors:[], submitted:0, planned:0, rateLimited:0, unserved:0, stoppedEarly:false, attempts:0 };
const now=Date.now(); const submittedAt=Number(prev.submittedAt)||now; const elapsed=now-submittedAt;
const rows={};
try{ for(const it of $('Read Callbacks').all()){ const j=it.json||{}; const id=String(j.trackId||'').trim(); if(id) rows[id]=j; } }catch(e){}
const st={ pending:[], done:(prev.done||[]).slice(), toPoll:(prev.toPoll||[]).slice(), errors:(prev.errors||[]).slice(), submitted:prev.submitted||0, planned:prev.planned||0, rateLimited:prev.rateLimited||0, unserved:prev.unserved||0, stoppedEarly:!!prev.stoppedEarly, submittedAt:submittedAt, attempts:(prev.attempts||0)+1, callbacks:(prev.callbacks||0)+Object.keys(rows).length };
const known=(v)=>v!==null&&v!==undefined&&v!==''&&isFinite(Number(v))&&Number(v)>=0;
for(const p of pend){
  const entry={ domain:p.domain, trackId:p.trackId, gap:Number(p.gap)||0 };
  const r=rows[p.trackId];
  const state=r?String(r.state||'').toUpperCase():'';
  if(state==='DONE'){
    if(known(r.found)) st.done.push(Object.assign(entry,{ total:known(r.total)?Number(r.total):0, found:Number(r.found) }));
    else st.toPoll.push(Object.assign(entry,{ why:'webhook DONE without statistics' }));
    continue;
  }
  if(state&&state!=='PENDING'&&state!=='IN_PROGRESS'&&state!=='PROCESSING'&&state!=='RUNNING'){ st.errors.push({ domain:p.domain, reason:'AI-Ark export '+p.trackId+' reported state '+state }); continue; }
  st.pending.push(entry);
}
if(st.pending.length&&elapsed+WAIT_MS>=MAX_POLL_MS){
  const secs=Math.round(elapsed/1000);
  for(const p of st.pending) st.toPoll.push(Object.assign({}, p, { why:'no webhook after '+secs+' s' }));
  st.pending=[];
}
return [{ json: st }];
