// Lane Tick: adds this chunk's vendor counters and writer counters (both from the chunk worker's
// answer, Call Chunk) to the lane's running totals in this execution's static data, then emits one
// unconditional tick so the loop never depends on the payload of the work.
const sd=$getWorkflowStaticData('global'); const a=sd.lane;
const n=(v)=>Number(v)||0;
let r={}; try{ r=$('Call Chunk').first().json||{}; }catch(e){}
a.chunks++;
if(r.error&&r.parse===undefined){ a.errors+=1; const m='chunk worker crashed: '+String((r.error&&r.error.message)||r.error).slice(0,160); if(!a.firstError) a.firstError=m; return [{ json:{ tick:true, chunk:a.chunks } }]; }
const p=r.parse||{}; const s=p.stats||{};
a.called+=n(s.called); a.returned+=n(s.returned); a.kept+=n(s.kept); a.credits+=n(s.credits); a.errors+=n(s.errors);
if(!a.firstError&&s.firstError) a.firstError=String(s.firstError).slice(0,200);
if(p.status==='skipped'&&p.reason&&p.reason!=='nothing to ask') a.skipped=String(p.reason);
if(p.status==='error'&&!a.firstError) a.firstError=String(p.reason||'').slice(0,200);
const w=r.writer||{};
if(w.crashed){ a.writeErrors+=1; if(a.writeReasons.length<5) a.writeReasons.push('writer crashed: '+w.crashed); }
else { for(const k of ['built','updated','heldUnchanged','dupes','noKey','fenced','emailsAppended','dnc','written','updatedWritten','writeErrors']) a[k]+=n(w[k]); if(w.singleSelectSource) a.singleSelectSource=true; for(const x of (w.writeReasons||[])){ if(a.writeReasons.length<5&&a.writeReasons.indexOf(x)<0) a.writeReasons.push(x); } for(const d of (w.coveredDomains||[])) a.coveredDomains[d]=1; }
return [{ json:{ tick:true, chunk:a.chunks } }];
