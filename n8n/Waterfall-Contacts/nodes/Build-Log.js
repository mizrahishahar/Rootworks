// Build Log: the one launch-row log, written once after the writer loop ended and the AI-Ark
// lane's row landed (or the 25-minute wait ran out). The counters come from the pass rows:
// Waterfall Contacts Batch writes one Hub row per writer batch keyed "<this execution>-<n>" and
// one for the AI-Ark lane keyed "<this execution>-ark", each with its counters JSON in Tally;
// Read Batch Rows pulled them by that prefix, and they are summed here (no read-add-write Tally
// loop in this machine, ruled 2026-09-02). The lane row carries the final coverage of every batch
// it took and replaces those writer rows' coverage. Pass outcomes come from every Pass Result run,
// the lane from Ark Lane, the wait verdict from Ark Rows Check, hand-offs from every Fire
// Waterfall run, the view checks from every Find Waterfall View run. Status computed from
// failed[], skips separated from errors, Client attached (a run serves exactly one client).
const p=$('Launch Params').first().json;
let cfg={}; try{ cfg=$('Find Tables').first().json||{}; }catch(e){}
let pick={ viewRows:0, noDomain:0, duplicate:0, capped:0, picked:0 };
try{ const j=$('Pick Companies').first().json||{}; if(j._stats) pick=j._stats; }catch(e){}
let mk={ heldRows:0, heldCompanies:0, companiesIn:0, batches:0 };
try{ const j=$('Make Batches').first().json||{}; if(j._stats) mk=j._stats; }catch(e){}
const num=(v)=>Number(v)||0;
const runs=(name)=>{ const out=[]; for(let i=0;i<10000;i++){ let it=null; try{ it=$(name).all(0,i); }catch(e){ break; } if(!it||!it.length) break; out.push(it); } return out; };
const zero=()=>({ called:0, returned:0, kept:0, credits:0, errors:0, firstError:'' });
const t={ batches:0, arkPasses:0, companies:0, contagen:zero(), supersoniq:zero(), aiark:zero(), built:0, heldSkipped:0, dupes:0, dnc:0, written:0, writeErrors:0, stamped:0, stampErrors:0, covered:0, zero:0, zeroDomains:[], failReasons:[] };
// The pass rows, by prefix. Each row's Tally is that pass's counters JSON.
const prefix=String($execution.id)+'-';
const writerRows={}; let arkRow=null;
try{
  for(const it of $('Read Batch Rows').all()){
    const r=it.json||{}; if(!r.id||!r.fields) continue;
    const f=r.fields; const id=String(f['Execution ID']||'');
    if(id.indexOf(prefix)!==0) continue;
    const key=id.slice(prefix.length);
    const isArk=/(^|-)ark$/.test(key);
    const n=Number(key.replace(/-?ark$/,''))||0;
    let c=null; try{ c=JSON.parse(f.Tally||''); }catch(e){}
    if(!c||typeof c!=='object') c=null;
    const row={ status:String(f.Status||''), errors:num(f.Errors), counters:c };
    if(isArk) arkRow=row; else writerRows[n]=row;
    if(!c) continue;
    if(isArk) t.arkPasses+=1; else { t.batches+=1; t.companies+=num(c.companiesIn); }
    for(const k of ['contagen','supersoniq','aiark']){ const s=c[k]||{}; const d=t[k]; d.called+=num(s.called); d.returned+=num(s.returned); d.kept+=num(s.kept); d.credits+=num(s.credits); d.errors+=num(s.errors); if(!d.firstError&&s.firstError) d.firstError=String(s.firstError).slice(0,300); }
    for(const k of ['built','heldSkipped','dupes','dnc','written','writeErrors','stamped','stampErrors']) t[k]+=num(c[k]);
    for(const x of (Array.isArray(c.failReasons)?c.failReasons:[])){ if(t.failReasons.length<10) t.failReasons.push(String(x).slice(0,200)); }
  }
}catch(e){}
// The lane and its verdict.
let lane=null; try{ lane=$('Ark Lane').first().json||null; }catch(e){}
const laneNums=new Set(((lane&&Array.isArray(lane.batchNums))?lane.batchNums:[]).map(x=>Number(x)||0));
const arkFired=!!(lane&&lane.fire);
const laneC=(arkRow&&arkRow.counters)||{};
let wait=null; try{ wait=$('Ark Rows Check').first().json||null; }catch(e){}
const arkMissing=arkFired&&!arkRow;
// Coverage: the lane row is the final state of every batch it took; a batch it did not take
// (crashed, or all paid calls dead) keeps its own writer row's coverage.
if(arkRow&&arkRow.counters){
  t.covered+=num(laneC.covered); t.zero+=num(laneC.zero);
  t.zeroDomains=t.zeroDomains.concat(Array.isArray(laneC.zeroDomains)?laneC.zeroDomains:[]).slice(0,50);
}
for(const k of Object.keys(writerRows)){
  const n=Number(k)||0;
  if(arkRow&&arkRow.counters&&laneNums.has(n)) continue;
  const c=writerRows[k].counters; if(!c) continue;
  t.covered+=num(c.covered); t.zero+=num(c.zero);
  t.zeroDomains=t.zeroDomains.concat(Array.isArray(c.zeroDomains)?c.zeroDomains:[]).slice(0,50);
}
const rowsRead=Object.keys(writerRows).length+(arkRow?1:0);
// Passes.
const batches=runs('Pass Result').map(r=>r[0].json||{});
const launched=batches.length;
const closed=batches.filter(x=>x.status==='closed').length;
const stopped=batches.find(x=>x.allFailed)||null;
const notLaunched=Math.max(0, num(mk.batches)-launched);
// Hand-offs.
const isFired=(j)=>{ if(!j) return false; if(j.error&&j.statusCode===undefined) return /timeout|timed out|ETIMEDOUT|ESOCKETTIMEDOUT/i.test(String((j.error&&j.error.message)||'')); const s=num(j.statusCode); return s>=200&&s<300; };
const fires=runs('Fire Waterfall').map(r=>r[0].json||{});
const fired=fires.filter(isFired).length;
const fireFailed=fires.length-fired;
const views=runs('Find Waterfall View').map(r=>r[0].json||{});
const viewSkips=views.filter(v=>v.hasView===false&&v.metaOk).length;
const metaFails=views.filter(v=>!v.metaOk).length;
const failed=[];
const tierName={ contagen:'ContaGen', supersoniq:'Supersoniq', aiark:'AI-Ark' };
for(const k of ['contagen','supersoniq','aiark']){ const s=t[k]; for(let i=0;i<num(s.errors);i++) failed.push({ tier:tierName[k], reason:s.firstError||'call failed' }); }
for(let i=0;i<num(t.writeErrors);i++) failed.push({ tier:'People writer', reason:'row not in the answer (see the pass rows for the HTTP reason)' });
for(let i=0;i<num(t.stampErrors);i++) failed.push({ tier:'Contacts Pulled At stamp', reason:'row not in the answer' });
for(const x of batches){
  const has=!!writerRows[x.batchNum];
  if(x.status==='closed'){ if(!has) failed.push({ tier:'Batch '+x.batchNum, reason:'closed but no Hub row was read back under '+prefix+x.batchNum }); continue; }
  if(x.status==='allFailed') failed.push({ tier:'Batch '+x.batchNum, reason:'every paid call failed after retry ('+x.reason+'); no further batches were launched' });
  else if(x.status==='crashed') failed.push({ tier:'Batch '+x.batchNum, reason:'crashed ('+x.reason+'); no counters from it'+(has?', though its row landed and is counted':'') });
  else failed.push({ tier:'Batch '+x.batchNum, reason:x.reason||x.status });
}
if(arkMissing) failed.push({ tier:'AI-Ark lane', reason:'no "'+prefix+'ark" row within the '+(wait?wait.elapsedS+' s':'')+' wait (timed out; it may still be running and will write its row, uncounted here)' });
if(arkRow&&arkRow.status==='Failed') failed.push({ tier:'AI-Ark lane', reason:'every export failed' });
for(let i=0;i<num(laneC.arkUnserved);i++) failed.push({ tier:'AI-Ark lane', reason:'company never submitted; the lane stopped after eight rate-limit answers in a row' });
for(let i=0;i<metaFails;i++) failed.push({ tier:'Waterfall hand-over', reason:'the base meta could not be read, the view check did not run' });
for(const j of fires){ if(!isFired(j)) failed.push({ tier:'Waterfall hand-over', reason:(j.error&&j.statusCode===undefined)?('door call errored: '+String((j.error&&j.error.message)||'').slice(0,100)):('door HTTP '+j.statusCode) }); }
let dur=0; try{ dur=Math.max(0,Math.round(($now.toMillis()-new Date(p.startedAt).getTime())/1000)); }catch(e){}
const companiesIn=num(pick.picked);
const covered=num(t.covered);
const pct=companiesIn?Math.round(100*covered/companiesIn):0;
const tier=(lbl,s)=>'- **'+lbl+':** called '+num(s.called)+', returned '+num(s.returned)+', kept '+num(s.kept)+', credits '+(Math.round(num(s.credits)*100)/100)+(num(s.errors)?', errors '+num(s.errors):'');
const on=(s)=>(p.sources||[]).indexOf(s)>-1;
const zd=Array.isArray(t.zeroDomains)?t.zeroDomains:[];
const lines=[
  '**'+companiesIn+' companies in, '+num(t.written)+' people written into '+(cfg.peopleTableName||'People')+', '+covered+' of '+companiesIn+' covered ('+pct+'%)**',
  '',
  '**Scope:** one client, Companies view "'+p.view+'", Max companies '+num(p.maxCompanies),
  '**Sources:** '+(p.sources||[]).join(', '),
  '**Departments:** '+((p.departments||[]).length?(p.departments||[]).join(', '):'blank (no department filter)')+((p.cgDepartments||[]).length?'; DiscoLike gets '+(p.cgDepartments||[]).join(', '):'')+((p.departmentsUnmapped||[]).length?'; no DiscoLike home for '+(p.departmentsUnmapped||[]).join(', '):''),
  '**Cap per company:** by band, 1-10 four, 11-50 six, 51-200 ten, 201 and up twelve (per source at ContaGen and Supersoniq, absolute at AI-Ark)',
  '',
  '**Funnel**',
  '- **Companies in:** '+companiesIn+' ('+num(pick.viewRows)+' view rows, '+num(mk.batches)+' writer batches of 250'+(on('AI-Ark')?', then one AI-Ark lane over every company they covered':'')+')',
  '- **Already held (tier zero):** '+num(mk.heldRows)+' people at '+num(mk.heldCompanies)+' companies'
];
if(on('ContaGen')) lines.push(tier('ContaGen', t.contagen));
if(on('Supersoniq')) lines.push(tier('Supersoniq', t.supersoniq));
if(on('AI-Ark')) lines.push(tier('AI-Ark', t.aiark)+(arkRow?(' (one lane over '+num(laneC.companiesIn)+' companies, '+num(laneC.underCap)+' still under cap, '+num(laneC.arkPlanned||laneC.underCap)+' exports planned'+(num(laneC.arkUnserved)?', '+num(laneC.arkUnserved)+' never submitted after the rate-limit stop':'')+')'):' (no lane row counted)'));
lines.push('- **People built:** '+num(t.built)+' (skipped: '+num(t.heldSkipped)+' already held, '+num(t.dupes)+' duplicate in the pull, '+num(t.dnc)+' on the DNC table)');
lines.push('- **Written (rows in the writer\'s answers):** '+num(t.written));
lines.push('- **Coverage:** '+covered+' of '+companiesIn+' companies with at least one person ('+pct+'%), from the AI-Ark lane row where it landed');
lines.push('- **Zero-contact companies:** '+num(t.zero)+(zd.length?' ('+zd.slice(0,20).join(', ')+(zd.length>20?', ...':'')+')':''));
lines.push('- **Contacts Pulled At stamped:** '+num(t.stamped));
lines.push('');
if(companiesIn){
  const bits=[launched+' writer batch'+(launched===1?'':'es')+' launched one at a time, '+closed+' closed'];
  if(on('AI-Ark')) bits.push(arkFired?('one AI-Ark lane fired over '+num(lane.companiesIn)+' companies from '+laneNums.size+' closed batch'+(laneNums.size===1?'':'es')+', '+(arkRow?'its row landed':'its row did not land')+(wait?(' after a '+wait.elapsedS+' s wait'+(wait.timedOut?' (timed out)':'')):'')):'no AI-Ark lane fired');
  bits.push(rowsRead+' pass row'+(rowsRead===1?'':'s')+' read back under "'+prefix+'*" (each pass writes its own Hub row, summed here)');
  if(stopped) bits.push('stopped after batch '+stopped.batchNum+', every paid call in it failed'+(notLaunched?', '+notLaunched+' not launched':''));
  lines.push('**Passes:** '+bits.join('; '));
}
if(num(laneC.arkRateLimited)) lines.push('**AI-Ark rate limiting:** '+num(laneC.arkRateLimited)+' export'+(num(laneC.arkRateLimited)===1?'':'s')+' answered HTTP 429'+(laneC.arkStopped?'; the lane stopped submitting after eight in a row and left '+num(laneC.arkUnserved)+' companies unserved':''));
const skips=[];
if(!companiesIn) lines.push('**Waterfall:** not fired, nothing was pulled');
else if(fires.length||viewSkips){
  const bits=[];
  if(fired) bits.push(fired+' hand-off'+(fired===1?'':'s')+' fired to the email door (People view "Not Waterfalled", one after every writer batch and one after the AI-Ark lane\'s row, the door not awaited; the email waterfall writes its own rows)');
  if(fireFailed) bits.push(fireFailed+' failed');
  if(viewSkips) bits.push(viewSkips+' skipped, People had no view "Not Waterfalled"');
  lines.push('**Waterfall:** '+bits.join('; '));
  if(viewSkips) skips.push('waterfall hand-over skipped '+viewSkips+' time'+(viewSkips===1?'':'s')+', People has no view "Not Waterfalled"');
}
else lines.push('**Waterfall:** no hand-off ran (no pass closed)');
if(pick.noDomain) skips.push(num(pick.noDomain)+' view rows without a domain');
if(pick.duplicate) skips.push(num(pick.duplicate)+' duplicate domains in the view');
if(pick.capped) skips.push(num(pick.capped)+' view rows beyond Max companies');
if(!companiesIn) skips.push('view "'+p.view+'" had no rows to work');
if(notLaunched&&stopped) skips.push(notLaunched+' batches not launched after batch '+stopped.batchNum+' failed every paid call');
if((p.departmentsUnmapped||[]).length) skips.push('departments with no DiscoLike value: '+(p.departmentsUnmapped||[]).join(', '));
if(skips.length) lines.push('', '**Skipped ('+skips.join('; ')+')**');
if(failed.length){
  const byReason={}; for(const f of failed){ const k=f.tier+': '+f.reason; byReason[k]=(byReason[k]||0)+1; }
  lines.push('', '**Failures ('+failed.length+')**');
  for(const [r,c] of Object.entries(byReason).slice(0,12)) lines.push('- '+c+' x '+r);
  for(const r of t.failReasons.slice(0,5)) lines.push('- '+r);
}
const tally=Object.assign({}, t, { executionId: String($execution.id), passes: { launched: launched, closed: closed, arkFired: arkFired?1:0, arkLanded: arkRow?1:0, arkMissing: arkMissing?1:0, arkBatches: laneNums.size, arkPlanned: num(laneC.arkPlanned), arkSubmitted: num((laneC.aiark||{}).called), arkRateLimited: num(laneC.arkRateLimited), arkUnserved: num(laneC.arkUnserved), arkStopped: !!laneC.arkStopped, waitS: wait?wait.elapsedS:0, rows: rowsRead, notLaunched: notLaunched }, handoffs: { fired: fired, failed: fireFailed, skipped: viewSkips } });
const log={
  'Automation':'Waterfall Contacts',
  'Status': failed.length?'Succeeded with errors':'Succeeded',
  'Trigger': p.trigger||'form',
  'Errors': failed.length,
  'Run at': $now.toISO(),
  'Target': (cfg.peopleTableName||'People')+' ('+(cfg.peopleTableId||'')+')',
  'View': p.view,
  'Records In': companiesIn,
  'Records Out': num(t.written),
  'Duration s': dur,
  'Description': lines.join('\n'),
  'Tally': JSON.stringify(tally),
  'Execution Link':'https://n8n.flowroots.com/workflow/'+$workflow.id+'/executions/'+$execution.id,
  'Execution ID': String($execution.id),
  'Client': [p.clientRecId]
};
return [{ json: log }];
