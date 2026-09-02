// Ark Rows Check: are the ark rows in? Expected = one per Fire Ark Pass run (every closed writer
// batch with AI-Ark on); landed = the "-ark" rows Read Ark Rows found under this execution's
// prefix. Done when every expected row landed, when nothing was fired, or when 25 minutes passed
// since the writer loop ended (the missing ones are then logged as timed out; they keep running
// and write their rows, the close just no longer waits). Otherwise Ark Wait sleeps 20 s and Read
// Ark Rows looks again.
const MAX_WAIT_MS=25*60*1000;
const runs=(name)=>{ const out=[]; for(let i=0;i<10000;i++){ let it=null; try{ it=$(name).all(0,i); }catch(e){ break; } if(!it||!it.length) break; out.push(it); } return out; };
const fired=runs('Ark Batch Item').map(r=>Number((r[0].json||{}).batchNum)||0).filter(Boolean);
const prefix=String($execution.id)+'-';
const landed=new Set();
for(const it of $input.all()){ const j=it.json||{}; const f=j.fields||{}; const id=String(f['Execution ID']||''); if(!j.id||id.indexOf(prefix)!==0||!/-ark$/.test(id)) continue; const n=Number(id.slice(prefix.length).replace(/-ark$/,''))||0; if(n) landed.add(n); }
let startedAt=Date.now(); try{ startedAt=Number($('Ark Wait Start').first().json.waitStartedAt)||startedAt; }catch(e){}
const elapsed=Date.now()-startedAt;
const missing=fired.filter(n=>!landed.has(n));
const timedOut=missing.length>0&&elapsed>=MAX_WAIT_MS;
return [{ json: { done: missing.length===0||timedOut, expected: fired.length, landed: landed.size, missing: missing, timedOut: timedOut, elapsedS: Math.round(elapsed/1000) } }];
