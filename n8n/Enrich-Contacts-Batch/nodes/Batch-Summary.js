// Batch Summary: the counters of this pass, and the ONLY thing that crosses back to the parent
// (through Batch Response, after this pass's own Hub row is written). Per provider: the verdict
// its sub-workflow answered with (ok, skipped with a reason, error with a cause) and its counters.
// Written rows are counted from the writer's answers (records[] of every 2xx PATCH), never from
// item ids; a request that was not 2xx counts every record it carried as a write error with the
// HTTP reason (never retried: a 429 locks Airtable for 30 s). Coverage reads the recount taken
// after the stamps. allFailed means every provider that was actually asked answered error (a skip
// is not a failure): the parent then stops launching batches.
const inp=$('Batch Input').first().json;
const plan=$('Plan Batch').first().json;
const n=(v)=>Number(v)||0;
const PRIORITY=['Blitz','GetLeads','QuickEnrich','Supersoniq'];
const NODE={ Blitz:'Run Blitz', GetLeads:'Run GetLeads', QuickEnrich:'Run QuickEnrich', Supersoniq:'Run Supersoniq' };
const providers={};
for(const p of PRIORITY){
  let j=null; try{ j=$(NODE[p]).first().json||null; }catch(e){ j=null; }
  const s=(j&&j.stats)||{};
  if(!j) providers[p]={ status:'skipped', reason:'not run', called:0, returned:0, kept:0, credits:0, errors:0, firstError:'', failReasons:[] };
  else if(j.error&&!j.provider) providers[p]={ status:'error', reason:'sub-workflow crashed: '+String((j.error&&(j.error.message||j.error.description))||j.error).slice(0,160), called:0, returned:0, kept:0, credits:0, errors:1, firstError:String((j.error&&j.error.message)||'crashed').slice(0,160), failReasons:[] };
  else providers[p]={ status:String(j.status||'ok'), reason:String(j.reason||''), called:n(s.called), returned:n(s.returned), kept:n(s.kept), credits:Math.round(n(s.credits)*100)/100, errors:n(s.errors), firstError:String(s.firstError||''), failReasons:(Array.isArray(s.failReasons)?s.failReasons:[]).slice(0,5), extra:{ dropped:n(s.dropped), emailBlanked:n(s.emailBlanked), resolved:n(s.resolved), unresolved:n(s.unresolved), rosterRows:n(s.rosterRows), emails:n(s.emails), pages:n(s.pages), noKey:n(s.noKey) } };
}
let merge={}; try{ const j=$('Merge People').first().json||{}; merge=j._stats||{}; }catch(e){}
const rowsOf=(name)=>{ try{ return $(name).all().filter(i=>i.json&&!i.json._empty&&i.json['Contact Key']).length; }catch(e){ return 0; } };
const dnc=Math.max(0, rowsOf('Clean Fields')-rowsOf('Apply DNC'));
const domainByKey={};
try{ for(const it of $('Merge People').all()){ const j=it.json||{}; const k=String(j['Contact Key']||'').toLowerCase(); if(k&&j._domain) domainByKey[k]=String(j._domain).toLowerCase(); } }catch(e){}
const parse=(b)=>{ if(typeof b!=='string') return b; try{ return JSON.parse(b); }catch(e){ return null; } };
const failReasons=[];
const reason=(prefix,j,b,status)=>{ const e=b&&b.error; const why=e?(typeof e==='object'?(e.message||e.type||JSON.stringify(e)):String(e)):((j.error&&j.error.message)||(typeof j.body==='string'?j.body:'')); return (prefix+' HTTP '+status+' '+String(why||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()).slice(0,180)+(status===429?' (rate limited; never retried)':''); };
let written=0, updatedWritten=0, writeErrors=0; const writtenByDomain={};
let chunks=[], resps=[];
try{ chunks=$('Chunk People').all().map(i=>i.json); resps=$('Write People').all(); }catch(e){}
resps.forEach((it,i)=>{
  const c=chunks[i]||{ size:0, keys:[], updates:0 }; const j=it.json||{};
  if(j.error&&j.statusCode===undefined){ writeErrors+=n(c.size); if(failReasons.length<10) failReasons.push('People writer: '+String((j.error&&j.error.message)||'call failed').slice(0,160)); return; }
  const status=n(j.statusCode); const b=parse(j.body===undefined?null:j.body);
  if(status>=200&&status<300&&b&&Array.isArray(b.records)){
    written+=b.records.length; updatedWritten+=n(c.updates);
    for(const r of b.records){ const k=String(((r||{}).fields||{})['Contact Key']||'').toLowerCase(); const d=domainByKey[k]||''; if(d) writtenByDomain[d]=(writtenByDomain[d]||0)+1; }
    if(b.records.length<n(c.size)){ writeErrors+=n(c.size)-b.records.length; if(failReasons.length<10) failReasons.push('People writer: '+(n(c.size)-b.records.length)+' of '+c.size+' records missing from a 2xx answer'); }
    return;
  }
  writeErrors+=n(c.size);
  if(failReasons.length<10) failReasons.push(reason('People writer',j,b,status));
});
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
const held={}; let recountRows=0;
const domainOf=(f)=>{ const v=f.Domain; return String(Array.isArray(v)?(v[0]||''):(v||'')).trim().toLowerCase(); };
try{ for(const it of $('Recount People').all()){ const j=it.json||{}; if(!j.id) continue; const f=j.fields||{}; const d=domainOf(f); if(!d) continue; const h=held[d]||(held[d]={ count:0 }); h.count++; recountRows++; } }catch(e){}
let covered=0; const zeroDomains=[];
for(const c of plan.plan){
  const have=((held[c.domain]||{}).count||0)+(writtenByDomain[c.domain]||0)+(!recountRows?(c.heldRows||[]).length:0);
  if(have>0) covered++; else if(zeroDomains.length<50) zeroDomains.push(c.domain);
}
const asked=PRIORITY.filter(p=>providers[p].status!=='skipped');
const allFailed=asked.length>0&&asked.every(p=>providers[p].status==='error');
for(const p of PRIORITY) for(const r of providers[p].failReasons) if(failReasons.length<10) failReasons.push(String(r));
return [{ json: {
  mode:'writer', batchNum: plan.batchNum, batchCount: plan.batchCount, logKey: inp.logKey,
  companiesIn: plan.plan.length, tiers: plan.tiers,
  providers: providers,
  returned: n(merge.returned), built: n(merge.built), updated: n(merge.updated), heldUnchanged: n(merge.heldUnchanged), dupes: n(merge.dupes), noKey: n(merge.noKey), fenced: n(merge.fenced), emailsAppended: n(merge.emailsAppended), singleSelectSource: !!merge.singleSelectSource, perProvider: merge.perProvider||{}, dnc: dnc,
  written: written, updatedWritten: updatedWritten, writeErrors: writeErrors, writeRequests: resps.length, stamped: stamped, stampErrors: stampErrors,
  covered: covered, zero: plan.plan.length-covered, zeroDomains: zeroDomains,
  allFailed: allFailed, failReasons: failReasons
} }];
