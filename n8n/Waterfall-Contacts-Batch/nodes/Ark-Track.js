// Ark Track: export submissions (fullResponse items aligned to Ark Requests) -> one poll
// state item: pending track ids, exports already DONE, submit errors, the attempt counter.
// Response shape verified in docs 2026-09-02: { trackId, state (PENDING | DONE), statistics
// { total, found }, webhook { state, retry }, description }.
let reqs=[]; try{ reqs=$('Ark Requests').all().map(i=>i.json); }catch(e){}
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const why=(b,raw)=>{ const m=b&&typeof b==='object'?(b.detail||b.error||b.message||b.description):null; const s=m?String(typeof m==='object'?JSON.stringify(m):m):(typeof raw==='string'?raw:(raw?JSON.stringify(raw):'')); return String(s||'empty body').slice(0,200); };
const st={ pending:[], done:[], errors:[], submitted:0, attempts:0 };
$input.all().forEach((it,i)=>{
  const req=reqs[i]; if(!req) return;
  st.submitted++;
  const j=it.json||{};
  if(j.error&&j.statusCode===undefined){ st.errors.push({ domain:req.domain, reason:'AI-Ark export: '+String((j.error&&j.error.message)||'call failed').slice(0,160) }); return; }
  const status=Number(j.statusCode)||0; const b=parse(j.body===undefined?j:j.body);
  const trackId=b&&typeof b==='object'?String(b.trackId||''):'';
  if(!(status>=200&&status<300)||!trackId){ st.errors.push({ domain:req.domain, reason:'AI-Ark export HTTP '+status+' '+why(b,j.body) }); return; }
  const entry={ domain:req.domain, trackId:trackId, gap:req.gap };
  if(String(b.state||'').toUpperCase()==='DONE') st.done.push(Object.assign(entry,{ total:Number((b.statistics||{}).total)||0, found:Number((b.statistics||{}).found)||0 }));
  else st.pending.push(entry);
});
return [{ json: st }];
