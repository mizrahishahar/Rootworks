// Prep: the batch's state, one item, carried from stage to stage by name. Per row: the cleaned
// names, the domain, the LinkedIn URL, and the candidate list built from the Email cell (every
// address the contact providers delivered, in the order they were merged; a foreign-domain address
// is kept last). Per domain: the address pattern the base already proves (from Status = done rows
// at that domain whose Final Email matches one of the known shapes for that person: the majority
// shape, at least one proof) and whether the domain is known catch-all (a done row there was
// verified by BounceBan). Shapes: first.last, first, flast, firstlast, first_last, f.last.
const rows=$('Read Records').all().map(i=>i.json||{}).filter(j=>j.id);
let known=[]; try{ known=$('Read Known').all().map(i=>i.json||{}).filter(j=>j.id); }catch(e){}
const norm=(v)=>String(Array.isArray(v)?(v[0]||''):(v||'')).trim().toLowerCase();
const clean=(s)=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'');
const SHAPES=['first.last','first','flast','firstlast','first_last','f.last'];
const shape=(sh,f,l)=>{ if(!f) return ''; if(sh==='first') return f; if(!l) return ''; if(sh==='first.last') return f+'.'+l; if(sh==='flast') return f.charAt(0)+l; if(sh==='firstlast') return f+l; if(sh==='first_last') return f+'_'+l; if(sh==='f.last') return f.charAt(0)+'.'+l; return ''; };
const splitEmails=(s)=>Array.from(new Set(String(s||'').split(/[,;\s]+/).map(e=>e.trim().toLowerCase()).filter(e=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e))));
const domainOf=(e)=>e.slice(e.lastIndexOf('@')+1);
// What the base proves per domain.
const proof={};
for(const k of known){ const f=k.fields||{}; const d=norm(f.Domain); const fe=String(f['Final Email']||'').trim().toLowerCase(); if(!d||!fe) continue; const p=proof[d]||(proof[d]={ shapes:{}, catchAll:false }); if(String(f['Email Verified By']||'')==='BounceBan') p.catchAll=true; const first=clean(f.first_name), last=clean(f.last_name); const local=fe.slice(0,fe.lastIndexOf('@')); for(const sh of SHAPES){ if(shape(sh,first,last)===local){ p.shapes[sh]=(p.shapes[sh]||0)+1; break; } } }
const patterns={}, domainCatchAll={};
for(const d of Object.keys(proof)){ const p=proof[d]; if(p.catchAll) domainCatchAll[d]=true; let best='',n=0; for(const sh of Object.keys(p.shapes)){ if(p.shapes[sh]>n){ n=p.shapes[sh]; best=sh; } } if(best) patterns[d]=best; }
const state={ order:[], rows:{}, patterns, domainCatchAll, stats:{ rows:rows.length, candidatesIn:0, knownRows:known.length, patternsKnown:Object.keys(patterns).length, mvCalls:0, blitzCalls:0, blitzFound:0, lmCalls:0, lmFound:0, guesses:0, catchAllDomains:0 } };
for(const r of rows){
  const f=r.fields||{};
  const domain=norm(f.Domain);
  const first=clean(f.first_name), last=clean(f.last_name);
  const emails=splitEmails(f.Email);
  const own=emails.filter(e=>domain&&(domainOf(e)===domain||domainOf(e).endsWith('.'+domain)));
  const foreign=emails.filter(e=>own.indexOf(e)<0);
  const candidates=own.concat(foreign).map(e=>({ email:e, origin:'database', mv:'' }));
  state.stats.candidatesIn+=candidates.length;
  state.order.push(r.id);
  state.rows[r.id]={ id:r.id, first, last, firstRaw:String(f.first_name||'').trim(), lastRaw:String(f.last_name||'').trim(), domain, linkedin:String(f['LinkedIn URL']||'').trim(), candidates, resolved:null, catchAll:!!domainCatchAll[domain], guessed:false, blitzAsked:false, lmAsked:false, error:'' };
}
state.stats.catchAllDomains=Object.keys(domainCatchAll).length;
return [{ json:state }];
