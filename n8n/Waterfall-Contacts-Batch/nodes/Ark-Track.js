// Ark Track: every window's export answers (Ark Export run by run, paired to Ark Window's items)
// -> one poll state: pending track ids, exports already DONE at submission, submit errors, the
// attempt counter, and submittedAt, the clock the 4-minute safety net runs on (this node runs the
// moment the last window landed). toPoll holds the exports whose statistics one read will settle
// later. Since 2026-09-02 the lane submits in windows of fifty behind Ark Window Check's circuit
// breaker, so this also carries what the breaker did: how many answers were 429, whether it
// stopped, and how many planned companies were therefore never submitted (unserved). Response
// shape verified in docs 2026-09-02: { trackId, state (PENDING | DONE), statistics
// { total, found }, webhook { state, retry }, description }.
const runs=(name)=>{ const out=[]; for(let i=0;i<10000;i++){ let it=null; try{ it=$(name).all(0,i); }catch(e){ break; } if(!it||!it.length) break; out.push(it); } return out; };
let planned=0; try{ planned=$('Ark Requests').all().length; }catch(e){}
let stoppedEarly=false;
try{ const cr=runs('Ark Window Check'); const last=cr[cr.length-1]; stoppedEarly=!!(last&&last[0]&&last[0].json&&last[0].json.stop); }catch(e){}
const reqRuns=runs('Ark Window'), respRuns=runs('Ark Export');
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const why=(b,raw)=>{ const m=b&&typeof b==='object'?(b.detail||b.error||b.message||b.description):null; const s=m?String(typeof m==='object'?JSON.stringify(m):m):(typeof raw==='string'?raw:(raw?JSON.stringify(raw):'')); return String(s||'empty body').slice(0,200); };
const st={ pending:[], done:[], toPoll:[], errors:[], submitted:0, planned:planned, rateLimited:0, unserved:0, stoppedEarly:stoppedEarly, submittedAt:Date.now(), attempts:0, callbacks:0 };
for(let r=0;r<respRuns.length;r++){
  const reqs=reqRuns[r]||[]; const resps=respRuns[r]||[];
  for(let i=0;i<resps.length;i++){
    const req=(reqs[i]||{}).json; if(!req) continue;
    st.submitted++;
    const j=(resps[i]||{}).json||{};
    if(j.error&&j.statusCode===undefined){ st.errors.push({ domain:req.domain, reason:'AI-Ark export: '+String((j.error&&j.error.message)||'call failed').slice(0,160) }); continue; }
    const status=Number(j.statusCode)||0; const b=parse(j.body===undefined?j:j.body);
    const trackId=b&&typeof b==='object'?String(b.trackId||''):'';
    if(status===429) st.rateLimited++;
    if(!(status>=200&&status<300)||!trackId){ st.errors.push({ domain:req.domain, reason:'AI-Ark export HTTP '+status+' '+why(b,j.body) }); continue; }
    const entry={ domain:req.domain, trackId:trackId, gap:req.gap };
    if(String(b.state||'').toUpperCase()==='DONE') st.done.push(Object.assign(entry,{ total:Number((b.statistics||{}).total)||0, found:Number((b.statistics||{}).found)||0 }));
    else st.pending.push(entry);
  }
}
st.unserved=Math.max(0, planned-st.submitted);
return [{ json: st }];
