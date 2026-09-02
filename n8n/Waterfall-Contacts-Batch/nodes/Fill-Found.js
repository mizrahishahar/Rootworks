// Fill Found: one item per export whose statistics are still unknown (a DONE webhook without
// statistics.found, or no webhook inside the 4-minute cap), each carrying the whole state; Ark
// Statistics reads each once, 250 ms apart, and Ark Found settles them. Nothing to poll: one
// placeholder (empty trackId) so Any To Poll? routes straight to Ark Found. The input is the
// state item from Ark Track (nothing was pending), Ark Check (the poll drained) or Ark Plan
// (no export at all; an empty state is built).
const inp=$input.first().json||{};
const st=Array.isArray(inp.pending)?inp:{ pending:[], done:[], toPoll:[], errors:[], submitted:0, submittedAt:Date.now(), attempts:0, callbacks:0 };
const list=Array.isArray(st.toPoll)?st.toPoll:[];
if(!list.length) return [{ json: { trackId:'', state:st } }];
return list.map(p=>({ json: { trackId:p.trackId, domain:p.domain, gap:Number(p.gap)||0, why:p.why||'', state:st } }));
