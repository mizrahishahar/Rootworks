// Ark Found: the final export state. The polled statistics (Ark Statistics answers, aligned to
// Fill Found's items) settle the unknowns: DONE with statistics -> done; still PENDING -> an
// error (the webhook never came and the cap passed); a 4xx -> an error (403 stuck refund, 404
// expired). Everything else is what the callbacks already settled. Ark Result Items reads done
// from here and fetches only where found > 0.
let polled=[]; let st=null;
try{ const all=$('Fill Found').all().map(i=>i.json); st=(all[0]&&all[0].state)||null; polled=all.filter(x=>x.trackId); }catch(e){}
st=st||{ pending:[], done:[], toPoll:[], errors:[], submitted:0, attempts:0, callbacks:0 };
const out={ pending:[], done:(st.done||[]).slice(), toPoll:[], errors:(st.errors||[]).slice(), submitted:st.submitted||0, submittedAt:st.submittedAt, attempts:st.attempts||0, callbacks:st.callbacks||0, polled:polled.length };
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const resp=polled.length?$input.all():[];
polled.forEach((p,i)=>{
  const j=(resp[i]&&resp[i].json)||{};
  const status=Number(j.statusCode)||0; const b=parse(j.body===undefined?j:j.body);
  const state=b&&typeof b==='object'?String(b.state||'').toUpperCase():'';
  const entry={ domain:p.domain, trackId:p.trackId, gap:Number(p.gap)||0 };
  if(status>=200&&status<300&&state==='DONE'){ out.done.push(Object.assign(entry,{ total:Number((b.statistics||{}).total)||0, found:Number((b.statistics||{}).found)||0 })); return; }
  if(status>=200&&status<300){ out.errors.push({ domain:p.domain, reason:'AI-Ark export '+p.trackId+' still '+(state||'unknown')+' ('+p.why+')' }); return; }
  out.errors.push({ domain:p.domain, reason:'AI-Ark statistics HTTP '+status+' for '+p.trackId+' ('+p.why+') '+String((b&&(b.description||b.message||b.error))||(j.error&&j.error.message)||'').slice(0,120) });
});
return [{ json: out }];
