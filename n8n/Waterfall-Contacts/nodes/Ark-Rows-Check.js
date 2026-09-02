// Ark Rows Check: is the AI-Ark lane's row in? One lane per run since 2026-09-02, so exactly one
// row is expected, "<this execution>-ark", or none at all when the lane did not fire (AI-Ark off,
// or no writer batch closed). Done when it landed, when nothing was fired, or when 25 minutes
// passed since the writer lane ended (the lane keeps running and writes its row; the close just no
// longer waits, and says so). Otherwise Ark Wait sleeps 20 s and Read Ark Rows looks again.
const MAX_WAIT_MS=25*60*1000;
let fired=false; try{ fired=$('Ark Lane').first().json.fire===true; }catch(e){}
const key=String($execution.id)+'-ark';
let landed=false;
for(const it of $input.all()){ const j=it.json||{}; if(!j.id) continue; const f=j.fields||{}; if(String(f['Execution ID']||'')===key) landed=true; }
let startedAt=Date.now(); try{ startedAt=Number($('Ark Wait Start').first().json.waitStartedAt)||startedAt; }catch(e){}
const elapsed=Date.now()-startedAt;
const missing=fired&&!landed;
const timedOut=missing&&elapsed>=MAX_WAIT_MS;
return [{ json: { done: !missing||timedOut, expected: fired?1:0, landed: landed?1:0, missing: missing, timedOut: timedOut, elapsedS: Math.round(elapsed/1000) } }];
