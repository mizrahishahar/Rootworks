// Write Check: the writer's count-back. Written rows are counted from every 2xx answer's records[];
// a request that was not 2xx counts every row it carried as a write error and names the ids. The
// writer never retries (a 429 locks the base for 30 s). Exactly one item out.
const n=(v)=>Number(v)||0;
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
let chunks=[], resps=[];
try{ chunks=$('Chunk Rows').all().map(i=>i.json); }catch(e){}
try{ resps=$('Write Rows').all(); }catch(e){}
let written=0, writeErrors=0; const failed=[], reasons=[];
const note=(ids,why)=>{ for(const id of (ids||[])){ if(failed.length<200) failed.push(id); } const w=String(why||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,180); if(w&&reasons.length<10) reasons.push(w); };
resps.forEach((it,i)=>{
  const c=chunks[i]||{ size:0, ids:[] }; const j=it.json||{};
  if(j.error&&j.statusCode===undefined){ writeErrors+=n(c.size); note(c.ids,'row writer: '+String((j.error&&j.error.message)||j.error||'call failed')); return; }
  const status=n(j.statusCode); const b=parse(j.body===undefined?null:j.body);
  if(status>=200&&status<300&&b&&Array.isArray(b.records)){ written+=b.records.length; if(b.records.length<n(c.size)){ const back={}; for(const r of b.records) back[String((r||{}).id||'')]=1; writeErrors+=n(c.size)-b.records.length; note((c.ids||[]).filter(id=>!back[id]),(n(c.size)-b.records.length)+' of '+c.size+' records missing from a 2xx answer'); } return; }
  const e=b&&b.error; const why=e?(typeof e==='object'?(e.message||e.type||JSON.stringify(e)):String(e)):((j.error&&j.error.message)||(typeof j.body==='string'?j.body:''));
  writeErrors+=n(c.size); note(c.ids,'HTTP '+status+' '+String(why||'')+(status===429?' (rate limited; never retried)':''));
});
return [{ json:{ written, writeErrors, writeRequests:resps.length, failed, writeReasons:reasons } }];
