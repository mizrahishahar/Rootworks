// Ark Check: statistics responses (aligned to Ark Pending) -> the next poll state. DONE moves
// to done; a 4xx (403 stuck refund, 404 expired) moves to errors; the rest stay pending.
// Every 15 s, up to 10 minutes (40 attempts), then the rest are errors, never a hang.
// Statistics endpoint verified in docs 2026-09-02: GET /v1/people/export/{trackId}/statistics,
// state PENDING | DONE, polling never costs credits.
const MAX_ATTEMPTS=40;
let pend=[]; try{ pend=$('Ark Pending').all().map(i=>i.json); }catch(e){}
const prev=(pend[0]&&pend[0].state)||{ pending:[], done:[], errors:[], submitted:0, attempts:0 };
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const gapOf=(trackId)=>{ const m=(prev.pending||[]).find(x=>x.trackId===trackId); return m?m.gap:0; };
const st={ pending:[], done:(prev.done||[]).slice(), errors:(prev.errors||[]).slice(), submitted:prev.submitted||0, attempts:(prev.attempts||0)+1 };
$input.all().forEach((it,i)=>{
  const p=pend[i]; if(!p) return;
  const j=it.json||{};
  const status=Number(j.statusCode)||0; const b=parse(j.body===undefined?j:j.body);
  const state=b&&typeof b==='object'?String(b.state||'').toUpperCase():'';
  const entry={ domain:p.domain, trackId:p.trackId, gap:gapOf(p.trackId) };
  if(status>=200&&status<300&&state==='DONE'){ st.done.push(Object.assign(entry,{ total:Number((b.statistics||{}).total)||0, found:Number((b.statistics||{}).found)||0 })); return; }
  if(status>=400&&status<500){ st.errors.push({ domain:p.domain, reason:'AI-Ark statistics HTTP '+status+' '+String((b&&(b.description||b.message||b.error))||'').slice(0,120) }); return; }
  st.pending.push(entry);
});
if(st.pending.length&&st.attempts>=MAX_ATTEMPTS){ for(const p of st.pending) st.errors.push({ domain:p.domain, reason:'AI-Ark export '+p.trackId+' still PENDING after 10 minutes' }); st.pending=[]; }
return [{ json: st }];
