// Add Guesses: for every unresolved row on a non-catch-all domain, the guesses become candidates
// with origin pattern, in this order: one guess from the shape the base already proves at that
// domain (gated: only from Status = done rows there, majority shape), then the six most common
// corporate shapes: first.last, first, flast, firstlast, first_last, f.last. A shape whose address
// is already a candidate (delivered by a provider, or already tried) is not repeated. A row without
// a first name gets no guess; shapes that need a last name are skipped when there is none.
const state=$('MV Blitz Collect').first().json;
const SHAPES=['first.last','first','flast','firstlast','first_last','f.last'];
const shape=(sh,f,l)=>{ if(!f) return ''; if(sh==='first') return f; if(!l) return ''; if(sh==='first.last') return f+'.'+l; if(sh==='flast') return f.charAt(0)+l; if(sh==='firstlast') return f+l; if(sh==='first_last') return f+'_'+l; if(sh==='f.last') return f.charAt(0)+'.'+l; return ''; };
for(const id of state.order){
  const r=state.rows[id];
  if(r.resolved||r.catchAll||r.guessed||!r.domain||!r.first) continue;
  r.guessed=true;
  const order=[]; const known=state.patterns[r.domain]; if(known) order.push(known); for(const sh of SHAPES){ if(order.indexOf(sh)<0) order.push(sh); }
  const have=new Set(r.candidates.map(c=>c.email));
  for(const sh of order){ const local=shape(sh,r.first,r.last); if(!local) continue; const e=local+'@'+r.domain; if(have.has(e)) continue; have.add(e); r.candidates.push({ email:e, origin:'pattern', mv:'', shape:sh }); state.stats.guesses++; }
}
return [{ json:state }];
