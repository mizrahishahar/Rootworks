// Chunk Tick: adds this chunk's answer (Call Chunk: the vendor verdict and the writer counters) to
// its provider's accumulator in this execution's static data, then emits one tick. When the chunk
// was the last of its provider the tick says laneClosed, and the launch row is refreshed.
const sd=$getWorkflowStaticData('global'); const run=sd.run;
const inp=$('Chunk Input').first().json||{};
if(inp._empty) return [{ json:{ tick:true, laneClosed:'' } }];
const a=run.lanes[inp.provider]; if(!a) throw new Error('Chunk Tick: no accumulator for '+inp.provider);
if(!a.startedAt) a.startedAt=new Date().toISOString();
const n=(v)=>Number(v)||0;
let r={}; try{ r=$('Call Chunk').first().json||{}; }catch(e){}
a.chunks++;
if(r.error&&r.parse===undefined){ a.errors+=1; const m='chunk worker crashed: '+String((r.error&&r.error.message)||r.error).slice(0,160); if(!a.firstError) a.firstError=m; }
else {
  const p=r.parse||{}; const s=p.stats||{};
  a.called+=n(s.called); a.returned+=n(s.returned); a.kept+=n(s.kept); a.credits+=n(s.credits); a.errors+=n(s.errors);
  if(!a.firstError&&s.firstError) a.firstError=String(s.firstError).slice(0,200);
  if(p.status==='skipped'&&p.reason&&p.reason!=='nothing to ask') a.skipped=String(p.reason);
  if(p.status==='error'&&!a.firstError) a.firstError=String(p.reason||'').slice(0,200);
  if(s.gate){ const g=a.gate||(a.gate={ relevantMin:s.gate.relevantMin, companiesIn:0, asked:0, skippedRelevant:0 }); g.companiesIn+=n(s.gate.companiesIn); g.asked+=n(s.gate.asked); g.skippedRelevant+=n(s.gate.skippedRelevant); }
  const w=r.writer||{};
  if(w.crashed){ a.writeErrors+=1; if(a.writeReasons.length<5) a.writeReasons.push('writer crashed: '+w.crashed); }
  else { for(const k of ['built','updated','heldUnchanged','dupes','noKey','fenced','emailsAppended','dnc','written','updatedWritten','writeErrors']) a[k]+=n(w[k]); if(w.singleSelectSource) a.singleSelectSource=true; for(const x of (w.writeReasons||[])){ if(a.writeReasons.length<5&&a.writeReasons.indexOf(x)<0) a.writeReasons.push(x); } for(const d of (w.coveredDomains||[])) a.coveredDomains[d]=1; }
}
const last=n(inp.idx)>=n(inp.count);
if(last) a.closed=true;
return [{ json:{ tick:true, laneClosed:last?inp.provider:'' } }];
