// Lane Tick: adds this chunk's vendor counters (SQ Parse) and writer counters (Call Writer) to the
// lane's running totals in this execution's static data (one execution, so the accumulator holds),
// then emits one unconditional tick so the loop never depends on the payload of the work.
const sd=$getWorkflowStaticData('global'); const a=sd.lane;
const n=(v)=>Number(v)||0;
let p={}; try{ p=$('SQ Parse').first().json||{}; }catch(e){}
const s=p.stats||{};
a.chunks++; a.called+=n(s.called); a.returned+=n(s.returned); a.kept+=n(s.kept); a.credits+=n(s.credits); a.errors+=n(s.errors);
if(!a.firstError&&s.firstError) a.firstError=String(s.firstError).slice(0,200);
if(p.status==='skipped'&&p.reason&&p.reason!=='nothing to ask') a.skipped=String(p.reason);
if(p.status==='error'&&!a.firstError) a.firstError=String(p.reason||'').slice(0,200);
let w={}; try{ w=$('Call Writer').first().json||{}; }catch(e){}
if(w.error&&w.written===undefined){ a.writeErrors+=1; if(a.writeReasons.length<5) a.writeReasons.push('writer crashed: '+String((w.error&&w.error.message)||w.error).slice(0,160)); }
else { for(const k of ['built','updated','heldUnchanged','dupes','noKey','fenced','emailsAppended','dnc','written','updatedWritten','writeErrors']) a[k]+=n(w[k]); if(w.singleSelectSource) a.singleSelectSource=true; for(const r of (w.writeReasons||[])){ if(a.writeReasons.length<5&&a.writeReasons.indexOf(r)<0) a.writeReasons.push(r); } for(const d of (w.coveredDomains||[])) a.coveredDomains[d]=1; }
return [{ json:{ tick:true, chunk:a.chunks } }];
