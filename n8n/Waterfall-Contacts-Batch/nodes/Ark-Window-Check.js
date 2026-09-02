// Ark Window Check: the circuit breaker on the AI-Ark lane, added 2026-09-02. AI-Ark answers HTTP
// 429 once its global ceiling is crossed, and a 429 storm means every further export is a wasted
// call: execution 7954 burned about 1,679 of them for twenty people because nothing ever stopped
// submitting. Count the trailing run of 429 answers across every window so far; eight in a row and
// the lane stops submitting, the companies it never reached are recorded as unserved by Ark Track,
// and the pass closes cleanly on what it did get instead of grinding through the rest.
const STOP_STREAK=8;
const runs=(name)=>{ const out=[]; for(let i=0;i<10000;i++){ let it=null; try{ it=$(name).all(0,i); }catch(e){ break; } if(!it||!it.length) break; out.push(it); } return out; };
let submitted=0, rateLimited=0, streak=0;
for(const run of runs('Ark Export')){
  for(const it of run){
    const j=it.json||{};
    submitted++;
    if(Number(j.statusCode)===429){ rateLimited++; streak++; } else streak=0;
  }
}
return [{ json: { stop: streak>=STOP_STREAK, streak: streak, rateLimited: rateLimited, submitted: submitted } }];
