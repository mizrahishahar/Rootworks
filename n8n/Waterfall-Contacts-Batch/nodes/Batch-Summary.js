// Batch Summary: the counters of this pass, and the ONLY thing that crosses back to the parent
// (through Batch Response, after this pass's own Hub row is written). Written rows are counted
// from the writer's answers (records[] of every 2xx PATCH), never from item ids; a request that
// was not 2xx counts every record it carried as a write error with the HTTP reason, and the
// writer never retried it (a 429 locks Airtable for 30 s). Coverage: writer mode reads the
// recount taken after the stamps (what the base holds now at the batch's domains) and hands that
// held state back as `held` (Contact Keys and LinkedIn URLs per domain, for the AI-Ark pass of
// this batch; Build Batch Log keeps it out of the Tally); ark mode reads the held state it was
// given plus what it wrote, so its coverage is the batch's final coverage and the parent takes it
// over the writer's.
const inp=$('Batch Input').first().json;
const plan=$('Plan Batch').first().json;
const mode=inp.mode==='ark'?'ark':'writer';
const n=(v)=>Number(v)||0;
const zero=()=>({ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', failReasons:[] });
const grab=(name)=>{ try{ return Object.assign(zero(), $(name).first().json.stats||{}); }catch(e){ return zero(); } };
const cg=grab('Parse ContaGen'), sq=grab('Parse Supersoniq'), ark=grab('Parse Ark');
const bstats=(name)=>{ try{ const j=$(name).first().json||{}; return j._stats||{}; }catch(e){ return {}; } };
const b1=bstats('Build People'), b2=bstats('Build Ark People');
const rowsOf=(name)=>{ try{ return $(name).all().filter(i=>i.json&&!i.json._empty&&i.json['Contact Key']).length; }catch(e){ return 0; } };
const dnc=Math.max(0, rowsOf('Clean Fields')-rowsOf('Apply DNC'));
const domainByKey={};
const learn=(name)=>{ try{ for(const it of $(name).all()){ const j=it.json||{}; const k=String(j['Contact Key']||'').toLowerCase(); if(k&&j._domain) domainByKey[k]=String(j._domain).toLowerCase(); } }catch(e){} };
learn('Build People'); learn('Build Ark People');
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const failReasons=[];
const reason=(prefix,j,b,status)=>{ const e=b&&b.error; const why=e?(typeof e==='object'?(e.message||e.type||JSON.stringify(e)):String(e)):((j.error&&j.error.message)||(typeof j.body==='string'?j.body:'')); return (prefix+' HTTP '+status+' '+String(why||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()).slice(0,180)+(status===429?' (rate limited; never retried)':''); };
// The writer's answers, aligned to the chunks it was sent.
let written=0, writeErrors=0; const writtenByDomain={};
let chunks=[], resps=[];
try{ chunks=$('Chunk People').all().map(i=>i.json); resps=$('Write People').all(); }catch(e){}
resps.forEach((it,i)=>{
  const c=chunks[i]||{ size:0, keys:[] }; const j=it.json||{};
  if(j.error&&j.statusCode===undefined){ writeErrors+=n(c.size); if(failReasons.length<10) failReasons.push('People writer: '+String((j.error&&j.error.message)||'call failed').slice(0,160)); return; }
  const status=n(j.statusCode); const b=parse(j.body===undefined?null:j.body);
  if(status>=200&&status<300&&b&&Array.isArray(b.records)){
    written+=b.records.length;
    for(const r of b.records){ const k=String(((r||{}).fields||{})['Contact Key']||'').toLowerCase(); const d=domainByKey[k]||''; if(d) writtenByDomain[d]=(writtenByDomain[d]||0)+1; }
    if(b.records.length<n(c.size)){ writeErrors+=n(c.size)-b.records.length; if(failReasons.length<10) failReasons.push('People writer: '+(n(c.size)-b.records.length)+' of '+c.size+' records missing from a 2xx answer'); }
    return;
  }
  writeErrors+=n(c.size);
  if(failReasons.length<10) failReasons.push(reason('People writer',j,b,status));
});
// The stamps' answers, writer mode only.
let stamped=0, stampErrors=0; let sChunks=[], sResps=[];
try{ sChunks=$('Stamp Rows').all().map(i=>i.json); sResps=$('Stamp Companies').all(); }catch(e){}
sResps.forEach((it,i)=>{
  const c=sChunks[i]||{ size:0 }; const j=it.json||{};
  if(j.error&&j.statusCode===undefined){ stampErrors+=n(c.size); if(failReasons.length<10) failReasons.push('Contacts Pulled At stamp: '+String((j.error&&j.error.message)||'call failed').slice(0,160)); return; }
  const status=n(j.statusCode); const b=parse(j.body===undefined?null:j.body);
  if(status>=200&&status<300&&b&&Array.isArray(b.records)){ stamped+=b.records.length; if(b.records.length<n(c.size)) stampErrors+=n(c.size)-b.records.length; return; }
  stampErrors+=n(c.size);
  if(failReasons.length<10) failReasons.push(reason('Contacts Pulled At stamp',j,b,status));
});
// Held state: writer mode from the recount taken after the stamps; ark mode from what it was given.
const held={}; let recountRows=0;
const domainOf=(f)=>{ const v=f.Domain; return String(Array.isArray(v)?(v[0]||''):(v||'')).trim().toLowerCase(); };
if(mode==='writer'){
  try{ for(const it of $('Recount People').all()){ const j=it.json||{}; if(!j.id) continue; const f=j.fields||{}; const d=domainOf(f); if(!d) continue; const h=held[d]||(held[d]={ count:0, keys:[], linkedin:[] }); h.count++; recountRows++; const k=String(f['Contact Key']||'').trim().toLowerCase(); if(k) h.keys.push(k); const li=String(f['LinkedIn URL']||'').trim(); if(li) h.linkedin.push(li); } }catch(e){}
}else{
  for(const c of plan.plan){ held[c.domain]={ count:n(c.held), keys:c.heldKeys||[], linkedin:c.heldLinkedin||[] }; recountRows+=n(c.held); }
}
let covered=0; const zeroDomains=[];
for(const c of plan.plan){
  const have=((held[c.domain]||{}).count||0)+(writtenByDomain[c.domain]||0)+(mode==='writer'&&!recountRows?n(c.held):0);
  if(have>0) covered++; else if(zeroDomains.length<50) zeroDomains.push(c.domain);
}
let underCap=0; try{ underCap=($('Ark Plan').first().json.arkRequests||[]).length; }catch(e){}
const ran=[cg,sq,ark].filter(s=>s.called>0);
const allFailed=ran.length>0&&ran.every(s=>s.errors>=s.called);
for(const s of [cg,sq,ark]) for(const r of (s.failReasons||[])) if(failReasons.length<10) failReasons.push(String(r));
const strip=(s)=>({ called:s.called, returned:s.returned, kept:s.kept, credits:s.credits, errors:s.errors, firstError:s.firstError||'' });
return [{ json: {
  mode: mode, batchNum: plan.batchNum, batchCount: plan.batchCount, logKey: inp.logKey,
  companiesIn: plan.plan.length, underCap: underCap,
  contagen: strip(cg), supersoniq: strip(sq), aiark: strip(ark),
  arkCallbacks: n(ark.callbacks), arkPolled: n(ark.polled), arkDone: n(ark.done), arkWithPeople: n(ark.withPeople),
  arkPlanned: n(ark.planned), arkRateLimited: n(ark.rateLimited), arkUnserved: n(ark.unserved), arkStopped: !!ark.stoppedEarly, arkBackoffs: n(ark.backoffs),
  built: n(b1.built)+n(b2.built), heldSkipped: n(b1.heldSkipped)+n(b2.heldSkipped), dupes: n(b1.dupes)+n(b2.dupes), dnc: dnc,
  written: written, writeErrors: writeErrors, writeRequests: resps.length, stamped: stamped, stampErrors: stampErrors,
  covered: covered, zero: plan.plan.length-covered, zeroDomains: zeroDomains,
  allFailed: allFailed, failReasons: failReasons,
  held: mode==='writer'?held:undefined
} }];
