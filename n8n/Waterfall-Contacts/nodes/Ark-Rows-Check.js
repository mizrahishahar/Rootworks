// Ark Rows Check: is the AI-Ark lane's row in? One lane per run since 2026-09-02, so exactly one
// row is expected, "<this execution>-ark", or none at all when the lane did not fire (AI-Ark off,
// or no writer batch closed). Done when it landed, when nothing was fired, or when 60 minutes
// passed since the writer lane ended (raised from 25 on 2026-09-02: the Operator ruled the AI-Ark
// lane may take longer than the rest of the run). Otherwise Ark Wait sleeps 20 s and Read Ark Rows
// looks again.
//
// The cap ends the WAIT, not the lane. A lane still running when it runs out keeps going and
// writes its own row when it finishes; the close simply stops waiting and says so. That is a skip
// on the parent's row, never a failure, and Build Log logs it as one.
const MAX_WAIT_MS=60*60*1000;
let fired=false; try{ fired=$('Ark Lane').first().json.fire===true; }catch(e){}
const key=String($execution.id)+'-ark';
let landed=false;
for(const it of $input.all()){ const j=it.json||{}; if(!j.id) continue; const f=j.fields||{}; if(String(f['Execution ID']||'')===key) landed=true; }
let startedAt=Date.now(); try{ startedAt=Number($('Ark Wait Start').first().json.waitStartedAt)||startedAt; }catch(e){}
const elapsed=Date.now()-startedAt;
const missing=fired&&!landed;
const timedOut=missing&&elapsed>=MAX_WAIT_MS;
return [{ json: { done: !missing||timedOut, expected: fired?1:0, landed: landed?1:0, missing: missing, timedOut: timedOut, stillRunning: timedOut, elapsedS: Math.round(elapsed/1000) } }];
