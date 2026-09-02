// Fill Found: one item per export whose statistics are still unknown (a DONE webhook without
// statistics.found, or no webhook inside the 4-minute cap); Ark Statistics reads each once, 250 ms
// apart, and Ark Found settles them. The whole state rides on the FIRST item only, which is all
// Ark Found reads: the list can be thousands long on a lane, and a copy per item is quadratic
// memory. Nothing to poll: one placeholder (empty trackId) so Any To Poll? routes straight to Ark
// Found. The input is the state item from Ark Track (nothing was pending), Ark Check (the poll
// drained) or Ark Plan (no export at all; an empty state is built).
const inp=$input.first().json||{};
const st=Array.isArray(inp.pending)?inp:{ pending:[], done:[], toPoll:[], errors:[], submitted:0, planned:0, rateLimited:0, unserved:0, stoppedEarly:false, submittedAt:Date.now(), attempts:0, callbacks:0 };
const list=Array.isArray(st.toPoll)?st.toPoll:[];
if(!list.length) return [{ json: { trackId:'', state:st } }];
return list.map((p,i)=>{
  const o={ trackId:p.trackId, domain:p.domain, gap:Number(p.gap)||0, why:p.why||'' };
  if(i===0) o.state=st;
  return { json: o };
});
